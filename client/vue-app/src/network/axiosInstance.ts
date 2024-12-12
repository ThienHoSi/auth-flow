import axios from 'axios'
import { authApi } from './api'
import { getAuthStorageValues, setAuthStorageValues } from '@/helper'
import useAuth from '@/composables/useAuth'

const { performLogout } = useAuth()

const BASE_URL = 'http://localhost:3000/api'

const publicAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

export const privateAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Flag to prevent multiple token refresh requests
let isRefreshing = false
// Define the structure of a retry queue item
interface RetryQueueItem {
  resolve: (value?: any) => void
  reject: (error?: any) => void
}
// Create a list to hold the request queue
const refreshAndRetryQueue: RetryQueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  refreshAndRetryQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  refreshAndRetryQueue.length = 0
}

export const refreshAccessToken = async () => {
  if (isRefreshing) {
    // Add the original request to queue
    return new Promise<void>((resolve, reject) => {
      refreshAndRetryQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true
  const { refreshToken } = getAuthStorageValues()
  if (!refreshToken) {
    // Perform logout, clear tokens...
    performLogout()
    return
  }
  try {
    const { data } = await authApi.refreshToken({ refreshToken })
    setAuthStorageValues(data.accessToken, data.refreshToken)

    privateAxiosInstance.defaults.headers.common['Authorization'] = data?.accessToken
    // Retry all requests in the queue with the new token
    processQueue(null, data.accessToken)
    return data?.accessToken
  } catch (refreshError) {
    // Handle token refresh error (logout, clear token...)
    processQueue(refreshError, null)
    // Perform logout, clear tokens...
    performLogout()
    return null
  } finally {
    isRefreshing = false
  }
}

// Add global request interceptor
privateAxiosInstance.interceptors.request.use(
  (config) => {
    // Modify request config here, e.g, headers
    const { accessToken } = getAuthStorageValues()
    if (accessToken) {
      config.headers['Authorization'] = 'Bearer ' + accessToken
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add global response interceptor
privateAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401) {
      // Handle refresh token if access token has expired
      const newAccessToken = await refreshAccessToken()
      if (newAccessToken) {
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken

        // Retry the original request
        return privateAxiosInstance(originalRequest)
      }
    }

    // Return a Promise rejection if the status code is not 401
    return Promise.reject(error)
  }
)

export default publicAxiosInstance
