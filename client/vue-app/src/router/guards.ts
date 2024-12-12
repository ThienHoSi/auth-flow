import { clearAuthStorageValues, getAuthStorageValues } from '@/helper'
import { refreshAccessToken } from '@/network/axiosInstance'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

declare global {
  interface Window {
    PATH: string
  }
}

const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isPublic } = to.meta
  // Store entered link into window.PATH
  if (!isPublic || to.name === 'HomePage') {
    window.PATH = to.fullPath
  }

  const { accessToken, expiresAt } = getAuthStorageValues()
  const accessTokenExpired = accessToken && expiresAt && Number(expiresAt) < Date.now()

  if (isPublic) {
    next()
  } else if (accessToken) {
    if (accessTokenExpired) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        next()
      } else {
        // Perform logout
        clearAuthStorageValues()
        next({ name: 'LoginPage' })
      }
    } else {
      next()
    }
  } else {
    next({ name: 'LoginPage' })
  }
}

export { authGuard }
