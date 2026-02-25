import type { IncomingHttpHeaders } from 'node:http';

export interface ApiRequest {
  method?: string;
  headers: IncomingHttpHeaders;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  end: (body?: string) => void;
}

function allowedOrigin(): string {
  return process.env.ALLOWED_ORIGIN ?? '*';
}

export function applyCors(response: ApiResponse): void {
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin());
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handlePreflight(request: ApiRequest, response: ApiResponse): boolean {
  applyCors(response);
  if (request.method?.toUpperCase() === 'OPTIONS') {
    response.status(204).end();
    return true;
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Bad Request';
}

export function parseJsonBody(request: ApiRequest): unknown {
  if (typeof request.body === 'string') {
    return JSON.parse(request.body);
  }
  return request.body ?? {};
}

export function firstQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value) && value[0]) return value[0];
  return null;
}
