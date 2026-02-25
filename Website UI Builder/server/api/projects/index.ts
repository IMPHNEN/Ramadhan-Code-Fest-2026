import { randomUUID } from 'node:crypto';
import { createOrUpdateProjectSchema } from '../../src/schema/projectSchema';
import { projectService } from '../../src/services/projectService';
import { ensureDbReady } from '../_lib/runtime';
import { type ApiRequest, type ApiResponse, applyCors, getErrorMessage, handlePreflight, parseJsonBody } from '../_lib/http';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (handlePreflight(request, response)) return;
  applyCors(response);

  try {
    await ensureDbReady();

    const method = request.method?.toUpperCase() ?? 'GET';
    if (method === 'GET') {
      const projects = await projectService.list();
      response.status(200).json(projects);
      return;
    }

    if (method === 'POST') {
      const body = parseJsonBody(request);
      const parsed = createOrUpdateProjectSchema.parse(body);
      const id = parsed.project.id || randomUUID();

      const summary = await projectService.upsert(id, parsed.name, {
        ...parsed.project,
        id,
        name: parsed.name
      });

      response.status(201).json(summary);
      return;
    }

    response.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    response.status(400).json({ message: getErrorMessage(error) });
  }
}
