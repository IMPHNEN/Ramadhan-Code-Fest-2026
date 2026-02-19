-- Add up migration script here
-- ULID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SCHEMA --
CREATE SCHEMA IF NOT EXISTS apalis;

-- TABLES --
CREATE TABLE IF NOT EXISTS apalis.workers (
    id TEXT PRIMARY KEY,
    worker_type TEXT NOT NULL,
    storage_name TEXT NOT NULL,
    layers TEXT NOT NULL DEFAULT '',
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS apalis.jobs (
    job JSONB NOT NULL,
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 25,
    run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_error TEXT,
    lock_at TIMESTAMPTZ,
    lock_by TEXT,
    done_at TIMESTAMPTZ,
    priority INTEGER DEFAULT 0,

    CONSTRAINT fk_worker_lock_by
        FOREIGN KEY (lock_by)
        REFERENCES apalis.workers(id)
        ON DELETE SET NULL
);

-- FUNCTIONS --
--get_jobs
CREATE OR REPLACE FUNCTION apalis.get_jobs(
    worker_id TEXT,
    v_job_type TEXT,
    v_job_count INTEGER DEFAULT 5
)
RETURNS SETOF apalis.jobs
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE apalis.jobs
    SET
        status = 'Running',
        lock_by = worker_id,
        lock_at = now()
    WHERE id IN (
        SELECT id
        FROM apalis.jobs
        WHERE
            (status = 'Pending'
             OR (status = 'Failed' AND attempts < max_attempts))
            AND run_at < now()
            AND job_type = v_job_type
        ORDER BY priority DESC, run_at ASC
        LIMIT v_job_count
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
END;
$$;

--push_jobs
CREATE OR REPLACE FUNCTION apalis.push_job(
    job_type TEXT,
    job JSONB DEFAULT NULL,
    status TEXT DEFAULT 'Pending',
    run_at TIMESTAMPTZ DEFAULT now(),
    max_attempts INTEGER DEFAULT 25,
    priority INTEGER DEFAULT 0
)
RETURNS apalis.jobs
LANGUAGE plpgsql
AS $$
DECLARE
    v_job_row apalis.jobs;
BEGIN
    IF job_type IS NOT NULL AND length(job_type) > 512 THEN
        RAISE EXCEPTION 'Job_type is too long (max length: 512)';
    END IF;

    IF max_attempts < 1 THEN
        RAISE EXCEPTION 'Job maximum attempts must be at least 1';
    END IF;

    INSERT INTO apalis.jobs (
        id,
        job,
        job_type,
        status,
        attempts,
        max_attempts,
        run_at,
        priority
    )
    VALUES (
        gen_random_uuid()::TEXT,
        job,
        job_type,
        status,
        0,
        max_attempts,
        run_at,
        priority
    )
    RETURNING * INTO v_job_row;

    RETURN v_job_row;
END;
$$;

--notify_new_jobs
CREATE OR REPLACE FUNCTION apalis.notify_new_jobs()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM pg_notify('apalis::job', 'insert');
    RETURN NEW;
END;
$$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_workers_last_seen
    ON apalis.workers(last_seen);

CREATE INDEX IF NOT EXISTS idx_workers_worker_type
    ON apalis.workers(worker_type);

CREATE INDEX IF NOT EXISTS idx_jobs_status
    ON apalis.jobs(status);

CREATE INDEX IF NOT EXISTS idx_jobs_job_type
    ON apalis.jobs(job_type);

CREATE INDEX IF NOT EXISTS idx_jobs_lock_by
    ON apalis.jobs(lock_by);

CREATE INDEX IF NOT EXISTS idx_jobs_priority_run_at
    ON apalis.jobs(priority DESC, run_at ASC);


CREATE TRIGGER trg_notify_workers_apalis
AFTER INSERT ON apalis.jobs
FOR EACH STATEMENT
EXECUTE FUNCTION apalis.notify_new_jobs();


