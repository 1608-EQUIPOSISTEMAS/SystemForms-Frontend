import axios from 'axios'
import { loader } from '@/utils/loader' // 👈 IMPORTAR

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  const uid = 1
  if (uid) {
    const method = (config.method || 'get').toLowerCase()
    if (['post', 'put', 'patch'].includes(method)) {
      if (config.data instanceof FormData) {
        if (!config.data.has('user_registration_id')) {
          config.data.append('user_registration_id', uid)
        }
      } else {
        config.data = { user_registration_id: uid, ...(config.data || {}) }
      }
    } else {
      config.params = { ...(config.params || {}), user_registration_id: uid }
    }
  }

  if (!config.meta?.skipLoader) loader.start() // ✅ AHORA SÍ FUNCIONA
  return config
}, (error) => {
  loader.stop()
  return Promise.reject(error)
})

api.interceptors.response.use((response) => {
  if (!response.config.meta?.skipLoader) loader.stop()
  return response
}, (error) => {
  if (!error.config?.meta?.skipLoader) loader.stop()
  return Promise.reject(error)
})

export default api