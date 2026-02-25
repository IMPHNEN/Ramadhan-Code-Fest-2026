import type { BuilderProject, ProjectSummary } from '@builder/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export const projectApi = {
  list: () => request<ProjectSummary[]>('/projects'),
  get: (id: string) => request<BuilderProject>(`/projects/${id}`),
  create: (payload: { name: string; project: BuilderProject }) =>
    request<ProjectSummary>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (id: string, payload: { name: string; project: BuilderProject }) =>
    request<ProjectSummary>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  remove: (id: string) =>
    request<{ ok: true }>(`/projects/${id}`, {
      method: 'DELETE'
    })
};
