import axios from 'axios'
import { useStore } from '@/store/useStore'

const apiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  timeout: 30000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = useStore.getState().apiKey
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { setError } = useStore.getState()
    setError(error.response?.data?.error || error.message)
    return Promise.reject(error)
  }
)

export default apiClient 