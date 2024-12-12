import axios, { type AxiosRequestConfig } from 'axios'
import { authApi } from './api'
import { getAuthStorageValues } from '@/helper'

const BASE_URL = 'http://localhost:3000/api'

const publicAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

export const privateAxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Define the structure of a retry queue item
interface RetryQueueItem {
  resolve: (value?: any) => void
  reject: (error?: any) => void
  config: AxiosRequestConfig
}

// Create a list to hold the request queue
const refreshAndRetryQueue: RetryQueueItem[] = []

// Flag to prevent multiple token refresh requests
let isRefreshing = false

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
  (response) => {
    // Modify response data here, if needed
    return response
  },
  async (error) => {
    const originalRequest: AxiosRequestConfig = error.config
    if (error.response && error.response.status === 401) {
      // Handle refresh token if access token has expired
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const refreshToken = localStorage.getItem('REFRESH_TOKEN')
          if (!refreshToken) {
            authApi.logout()
            return
          }

          const { data } = await authApi.refreshToken({ refreshToken })
          localStorage.setItem('REFRESH_TOKEN', data?.refreshToken || '')

          // Update the request headers with the new access token
          error.headers['Authorization'] = 'Bearer ' + data?.accessToken

          // Retry all requests in the queue with the new token
          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            privateAxiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err) => reject(err))
          })

          // Clear the queue
          refreshAndRetryQueue.length = 0

          // Retry the original request
          return privateAxiosInstance(error.config)
        } catch (refreshError) {
          // Handle token refresh error (logout...)
          authApi.logout()
          return refreshError
        } finally {
          isRefreshing = false
        }
      }
      // Add the original request to queue
      return new Promise<void>((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalRequest, resolve, reject })
      })
    }

    // Return a Promise rejection if the status code is not 401
    return Promise.reject(error)
  }
)

export default publicAxiosInstance
