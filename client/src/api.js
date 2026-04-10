import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

let _getToken = null

export function setTokenGetter(fn) {
  _getToken = fn
}

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken()
      config.headers.Authorization = `Bearer ${token}`
    } catch {
      // token fetch failed — request will go out without auth header
    }
  }
  return config
})

// ---- Users ----
export const getUsers = () => api.get('/users').then((r) => r.data)
export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data)
export const createUser = (data) => api.post('/users', data).then((r) => r.data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then((r) => r.data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

// ---- Games ----
export const getGames = () => api.get('/games').then((r) => r.data)
export const getGame = (id) => api.get(`/games/${id}`).then((r) => r.data)
export const createGame = (data) => api.post('/games', data).then((r) => r.data)
export const updateGame = (id, data) => api.put(`/games/${id}`, data).then((r) => r.data)
export const deleteGame = (id) => api.delete(`/games/${id}`)

// ---- Hints ----
export const getHints = (gameId) => api.get(`/games/${gameId}/hints`).then((r) => r.data)
export const createHint = (gameId, data) => api.post(`/games/${gameId}/hints`, data).then((r) => r.data)
export const updateHint = (hintId, data) => api.put(`/hints/${hintId}`, data).then((r) => r.data)
export const deleteHint = (hintId) => api.delete(`/hints/${hintId}`)

// ---- Players ----
export const getPlayers = (gameId) => api.get(`/games/${gameId}/players`).then((r) => r.data)
export const getAllPlayers = () => api.get('/players').then((r) => r.data)
export const deletePlayer = (id) => api.delete(`/players/${id}`)

// ---- Found Hints (Progress) ----
export const getFoundHints = (playerId) => api.get(`/players/${playerId}/found-hints`).then((r) => r.data)

// ---- Stats ----
export const getStats = () => api.get('/stats').then((r) => r.data)
