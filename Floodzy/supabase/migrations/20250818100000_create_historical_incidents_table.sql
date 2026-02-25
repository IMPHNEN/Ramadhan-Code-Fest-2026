-- supabase/migrations/20250818100000_create_historical_incidents_table.sql

-- Create a custom type for the incident status to ensure data integrity.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE public.incident_status AS ENUM (
            'resolved',
            'ongoing',
            'monitoring'
        );
    END IF;
END$$;

-- Create the main table to store historical incident data.
CREATE TABLE IF NOT EXISTS public.historical_incidents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL,
    location text NOT NULL,
    date timestamptz NOT NULL,
    description text,
    severity smallint NOT NULL CHECK (severity >= 1 AND severity <= 10),
    impact_areas text[],
    duration_hours integer,
    reported_losses bigint,
    casualties integer,
    evacuees integer,
    damage_level text,
    response_time_minutes integer,
    status public.incident_status NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments to the table and columns for better documentation.
COMMENT ON TABLE public.historical_incidents IS 'Stores historical data of various disaster incidents.';
COMMENT ON COLUMN public.historical_incidents.type IS 'Type of the disaster (e.g., Banjir, Gempa Bumi).';
COMMENT ON COLUMN public.historical_incidents.severity IS 'Severity rating of the incident on a scale of 1 to 10.';
COMMENT ON COLUMN public.historical_incidents.impact_areas IS 'An array of text describing the affected areas.';
COMMENT ON COLUMN public.historical_incidents.response_time_minutes IS 'The response time in minutes.';

-- Enable Row Level Security (RLS) on the new table.
ALTER TABLE public.historical_incidents ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to everyone.
-- For a production environment, you would likely want more restrictive policies.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users'
        AND tablename = 'historical_incidents'
    ) THEN
        CREATE POLICY "Enable read access for all users"
            ON public.historical_incidents
            FOR SELECT
            USING (true);
    END IF;
END$$;
