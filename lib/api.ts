/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'

const BASE_URL = 'https://owode-platform.onrender.com/api'
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('owode_admin_token')
    if (token) {
      config.headers = config.headers ?? {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

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
  unlockWallet: (userId: string) => api.post(`/admin/wallet/unlock/${userId}`),
  createAjoGroup: (data: { name: string; amount: number; frequency: string; totalMembers: number }) =>
    api.post('/admin/ajo/create', data),
  deleteAjoGroup: (id: string) => api.delete(`/admin/ajo/${id}`),
  getGroupRisk: (id: string) => api.get(`/guaranteed-ajo/risk/${id}`),
  getGuaranteedGroups: () => api.get('/guaranteed-ajo/groups'),
  getGuaranteedGroup: (id: string) => api.get(`/guaranteed-ajo/groups/${id}`),
  checkDefaults: (groupId: string) => api.post(`/guaranteed-ajo/check-defaults/${groupId}`),
  getGuaranteePool: () => api.get('/trust/guarantee-pool'),
  getUserTrustScore: (userId: string) => api.get(`/trust/score/${userId}`),
  getDefaults: () => api.get('/recovery/defaults'),
  runRecovery: () => api.post('/recovery/run'),
  writeOffDefault: (id: string) => api.post(`/recovery/write-off/${id}`)
}

export default api