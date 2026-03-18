const API_URL = import.meta.env.VITE_API_URL || 'https://sovereignroute-v1.onrender.com'

function getConfig() {
  return {
    workspaceId: import.meta.env.VITE_WORKSPACE_ID || localStorage.getItem('sr_workspace_id') || '',
    apiKey: import.meta.env.VITE_API_KEY || localStorage.getItem('sr_api_key') || '',
  }
}

export async function request(path, options = {}) {
  const { apiKey } = getConfig()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function saveConfig(workspaceId, apiKey) {
  localStorage.setItem('sr_workspace_id', workspaceId)
  localStorage.setItem('sr_api_key', apiKey)
}

export function loadConfig() {
  return {
    workspaceId: import.meta.env.VITE_WORKSPACE_ID || localStorage.getItem('sr_workspace_id') || '',
    apiKey: import.meta.env.VITE_API_KEY || localStorage.getItem('sr_api_key') || '',
  }
}

export async function previewRoute({ workspaceId, countryCode, dataType }) {
  return request(`/workspaces/${workspaceId}/route/preview`, {
    method: 'POST',
    body: JSON.stringify({ country_code: countryCode, data_type: dataType }),
  })
}

export async function listPolicies(workspaceId) {
  return request(`/workspaces/${workspaceId}/policies`)
}

export async function getWorkspace(workspaceId) {
  return request(`/workspaces/${workspaceId}`)
}
