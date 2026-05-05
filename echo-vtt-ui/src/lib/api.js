const BASE = import.meta.env.VITE_API_URL || ''

function getAIHeaders() {
  try {
    const raw = localStorage.getItem('echo-vtt-settings')
    if (!raw) return {}
    const { state } = JSON.parse(raw)
    if (!state || state.provider === 'mock') return {}
    const h = { 'X-AI-Provider': state.provider }
    if (state.apiKey)  h['X-AI-Key']      = state.apiKey
    if (state.model)   h['X-AI-Model']    = state.model
    if (state.baseUrl) h['X-AI-Base-Url'] = state.baseUrl
    return h
  } catch {
    return {}
  }
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...getAIHeaders() },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Players
  register: (data) => req('POST', '/api/players/register', data),
  login: (data) => req('POST', '/api/players/login', data),
  guest: (data) => req('POST', '/api/players/guest', data),
  getPlayer: (id) => req('GET', `/api/players/${id}`),
  listClasses: () => req('GET', '/api/players/classes'),
  createCharacter: (data) => req('POST', '/api/players/character', data),

  // Chronicles
  createChronicle: (data) => req('POST', '/api/chronicles/', data),
  getChronicle: (id) => req('GET', `/api/chronicles/${id}`),
  listChronicles: (gmId) => req('GET', `/api/chronicles/gm/${gmId}`),
  updateChronicle: (id, data) => req('PATCH', `/api/chronicles/${id}`, data),
  generateChronicle: (data) => req('POST', '/api/chronicles/generate', data),
  getByJoinCode: (code) => req('GET', `/api/chronicles/join/${code}`),

  // Sessions
  startSession: (chronicleId) => req('POST', `/api/sessions/start/${chronicleId}`),
  getSession: (id) => req('GET', `/api/sessions/${id}`),
  getSessionForChronicle: (chronicleId) => req('GET', `/api/sessions/chronicle/${chronicleId}`),
  generateEncounter: (data) => req('POST', '/api/sessions/encounter', data),
  narrate: (data) => req('POST', '/api/sessions/narrate', data),

  // Movement & Distance
  moveEntity: (data) => req('POST', '/api/sessions/move', data),
  getValidMoves: (data) => req('POST', '/api/sessions/valid-moves', data),
  getValidTargets: (data) => req('POST', '/api/sessions/valid-targets', data),
  applyDamage: (data) => req('POST', '/api/sessions/damage', data),

  // AI
  prompt: (data) => req('POST', '/api/ai/prompt', data),
  wizardStep: (data) => req('POST', '/api/ai/wizard-step', data),
  generateNpc: (data) => req('POST', '/api/ai/npc', data),
  testConnection: () => req('POST', '/api/ai/test', {}),
  generateEnemies: (data) => req('POST', '/api/ai/generate-enemies', data),
  generateBestiary: (data) => req('POST', '/api/ai/generate-bestiary', data),

  // Maps
  generateMap: (data) => req('POST', '/api/maps/generate', data),
  regenerateMap: (data) => req('POST', '/api/maps/regenerate', data),

  // Health
  health: () => req('GET', '/health'),
}
