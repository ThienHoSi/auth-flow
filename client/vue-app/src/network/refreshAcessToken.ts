import { getAuthStorageValues, setAuthStorageValues } from '@/helper'
import { authApi } from './api'

let refreshTokenRequest: Promise<boolean | { accessToken: string; refreshToken: string }> | null

export const refreshAccessToken = () => {
  if (refreshTokenRequest) return refreshTokenRequest
  refreshTokenRequest = new Promise((resolve) => {
    const { refreshToken } = getAuthStorageValues()
    if (!refreshToken) {
      // Perform logout
      authApi.logout()
      return
    }
    authApi
      .refreshToken({ refreshToken })
      .then(({ data }) => {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data
        if (!newAccessToken || !newRefreshToken) {
          // Perform logout, clear token...
          authApi.logout()
          resolve(false)
        } else {
          setAuthStorageValues(newAccessToken, newRefreshToken)
          resolve({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          })
        }
      })
      .catch((error) => {
        console.error('Axios error during fetching', error)
        resolve(false)
      })
      .finally(() => {
        refreshTokenRequest = null
      })
  })
  return refreshTokenRequest
}
