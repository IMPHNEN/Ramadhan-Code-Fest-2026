const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787/api';
async function request(path, init) {
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
    return response.json();
}
export const projectApi = {
    list: () => request('/projects'),
    get: (id) => request(`/projects/${id}`),
    create: (payload) => request('/projects', {
        method: 'POST',
        body: JSON.stringify(payload)
    }),
    update: (id, payload) => request(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    }),
    remove: (id) => request(`/projects/${id}`, {
        method: 'DELETE'
    })
};
