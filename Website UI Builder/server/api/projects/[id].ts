import { createOrUpdateProjectSchema } from '../../src/schema/projectSchema';
import { projectService } from '../../src/services/projectService';
import { ensureDbReady } from '../_lib/runtime';
import {
  type ApiRequest,
  type ApiResponse,
  applyCors,
  firstQueryValue,
  getErrorMessage,
  handlePreflight,
  parseJsonBody
} from '../_lib/http';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (handlePreflight(request, response)) return;
  applyCors(response);

  try {
    await ensureDbReady();

    const id = firstQueryValue(request.query?.id);
    if (!id) {
      response.status(400).json({ message: 'Project id is required' });
      return;
    }

    const method = request.method?.toUpperCase() ?? 'GET';
    if (method === 'GET') {
      const project = await projectService.get(id);
      if (!project) {
        response.status(404).json({ message: 'Project not found' });
        return;
      }
      response.status(200).json(project);
      return;
    }

    if (method === 'PUT') {
      const body = parseJsonBody(request);
      const parsed = createOrUpdateProjectSchema.parse(body);
      const summary = await projectService.upsert(id, parsed.name, {
        ...parsed.project,
        id,
        name: parsed.name
      });
      response.status(200).json(summary);
      return;
    }

    if (method === 'DELETE') {
      const ok = await projectService.remove(id);
      if (!ok) {
        response.status(404).json({ message: 'Project not found' });
        return;
      }
      response.status(200).json({ ok: true });
      return;
    }

    response.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    response.status(400).json({ message: getErrorMessage(error) });
  }
}
