import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealth = () => api.get('/health')

// ── Profiles ──────────────────────────────────────────────────────────────────
export const getProfiles = () => api.get('/profiles')
export const getProfile = (id) => api.get(`/profiles/${id}`)
export const createProfile = (data) => api.post('/profiles', data)
export const updateProfile = (id, data) => api.put(`/profiles/${id}`, data)
export const deleteProfile = (id) => api.delete(`/profiles/${id}`)
export const seedProfiles = () => api.post('/profiles/seed')
export const parseRawUpworkProfile = (raw_text) =>
  api.post('/profiles/parse-raw-upwork', { raw_text })

// ── Matcher ───────────────────────────────────────────────────────────────────
export const matchProfiles = (data) => api.post('/match', data)

// ── Proposal ──────────────────────────────────────────────────────────────────
export const generateProposal = (data) => api.post('/proposal/generate', data)

export default api

