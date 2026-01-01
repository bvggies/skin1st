import axios from 'axios'
import { getAccessToken } from './authClient'

const baseURL = process.env.REACT_APP_API_URL || '/api'

const api = axios.create({ baseURL })

// attach access token from memory token store
api.interceptors.request.use((config)=>{
  try{
    const token = getAccessToken()
    if (token && config.headers) config.headers['Authorization'] = `Bearer ${token}`
  }catch(e){}
  return config
})

export default api
