import { getAuthStorageValues } from '@/helper'
import { privateAxiosInstance } from '@/network/axiosInstance'
import { useRouter } from 'vue-router'

const useCheckingIfLoggedIn = () => {
  const router = useRouter()
  const { accessToken, expiresAt } = getAuthStorageValues()

  const accessTokenExpired = accessToken && expiresAt && Number(expiresAt) < Date.now()
  if (!accessToken || accessTokenExpired) return

  const getLoggedInUserId = async () => {
    const { data } = await privateAxiosInstance.get('/auth/me')
    return data.id
  }
  const navigateToView = async () => {
    try {
      const userId = await getLoggedInUserId()
      if (!userId) return

      if (window.PATH) {
        router.push(window.PATH)
      } else {
        router.push({
          name: 'DashboardPage'
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  navigateToView()
}

export default useCheckingIfLoggedIn
