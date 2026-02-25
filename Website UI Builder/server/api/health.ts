import type { ApiRequest, ApiResponse } from './_lib/http';
import { applyCors, handlePreflight } from './_lib/http';

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (handlePreflight(request, response)) return;
  applyCors(response);

  if (request.method?.toUpperCase() !== 'GET') {
    response.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  response.status(200).json({ ok: true });
}
