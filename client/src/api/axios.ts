import axios from 'axios'
import { getAccessToken, clearAccessToken } from './authClient'

const baseURL = process.env.REACT_APP_API_URL || '/api'

const api = axios.create({ 
  baseURL,
  withCredentials: true, // Include cookies in requests
})

// attach access token from memory token store
api.interceptors.request.use((config)=>{
  try{
    const token = getAccessToken()
    if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`
  }catch(e){}
  return config
})

// Handle 401 errors - redirect to login if unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      clearAccessToken()
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // Don't redirect if we're already handling it
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
