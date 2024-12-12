import { ACCESS_TOKEN, EXPIRES_AT, REFRESH_TOKEN } from '@/constants'

export const getAuthStorageValues = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN)
  const expiresAt = localStorage.getItem(EXPIRES_AT)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN)
  return { accessToken, expiresAt, refreshToken }
}

export const setAuthStorageValues = (token: string | null, refreshToken?: string | null) => {
  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_encodedHeader, encodedPayload, _tokenSignature] = token.split('.')
    const payload = JSON.parse(atob(encodedPayload))
    const expiresAt = payload.exp
    localStorage.setItem(ACCESS_TOKEN, token)
    localStorage.setItem(EXPIRES_AT, expiresAt)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN, refreshToken)
    }
  }
}

export const clearAuthStorageValues  = () => {
  localStorage.removeItem(ACCESS_TOKEN)
  localStorage.removeItem(EXPIRES_AT)
  localStorage.removeItem(REFRESH_TOKEN)
}
