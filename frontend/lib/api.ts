import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (our current auth system)
    try {
      const sessionData = localStorage.getItem('dazzle_session')
      if (sessionData) {
        const session = JSON.parse(sessionData)
        if (session.access_token && session.expires_at > Date.now()) {
          config.headers.Authorization = `Bearer ${session.access_token}`
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage session instead of cookies
      localStorage.removeItem('dazzle_session')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api