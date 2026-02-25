import type { BuilderProject, ProjectSummary } from '@builder/shared';
import { sql } from '../db/client';

interface ProjectRow {
  id: string;
  name: string;
  data_json: unknown;
  created_at: string;
  updated_at: string;
}

function toIso(value: string): string {
  const asDate = new Date(value);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toISOString();
  }
  return value;
}

function parseProjectPayload(data: unknown): BuilderProject {
  if (typeof data === 'string') {
    return JSON.parse(data) as BuilderProject;
  }
  return data as BuilderProject;
}

export const projectService = {
  async list(): Promise<ProjectSummary[]> {
    const rows = (await sql`
      SELECT id, name, created_at, updated_at
      FROM projects
      ORDER BY updated_at DESC
    `) as Array<Pick<ProjectRow, 'id' | 'name' | 'created_at' | 'updated_at'>>;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at)
    }));
  },

  async get(id: string): Promise<BuilderProject | null> {
    const rows = (await sql`
      SELECT id, name, data_json, created_at, updated_at
      FROM projects
      WHERE id = ${id}
      LIMIT 1
    `) as ProjectRow[];
    const row = rows[0];

    if (!row) return null;
    return parseProjectPayload(row.data_json);
  },

  async upsert(id: string, name: string, project: BuilderProject): Promise<ProjectSummary> {
    const now = new Date().toISOString();
    const createdAt = project.createdAt || now;
    const payload = JSON.stringify({ ...project, id, name, createdAt, updatedAt: now });

    const rows = (await sql`
      INSERT INTO projects (id, name, data_json, created_at, updated_at)
      VALUES (${id}, ${name}, ${payload}::jsonb, ${createdAt}::timestamptz, ${now}::timestamptz)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        data_json = EXCLUDED.data_json,
        updated_at = EXCLUDED.updated_at
      RETURNING id, name, created_at, updated_at
    `) as Array<Pick<ProjectRow, 'id' | 'name' | 'created_at' | 'updated_at'>>;

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at)
    };
  },

  async remove(id: string): Promise<boolean> {
    const rows = (await sql`
      DELETE FROM projects
      WHERE id = ${id}
      RETURNING id
    `) as Array<{ id: string }>;

    return rows.length > 0;
  }
};
