import axios from 'axios'

const BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Add token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('owode_admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminAPI = {
  login: (phone: string, password: string) =>
    api.post('/users/login', { phone, password }),

  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getTransactions: () => api.get('/admin/transactions'),
  getAjoGroups: () => api.get('/admin/ajo-groups'),
  getAgents: () => api.get('/admin/agents'),
  verifyUser: (userId: string) => api.post(`/kyc/verify/${userId}`),
  lockWallet: (userId: string) => api.post(`/admin/wallet/lock/${userId}`),
  unlockWallet: (userId: string) => api.post(`/admin/wallet/unlock/${userId}`)
}

export default api