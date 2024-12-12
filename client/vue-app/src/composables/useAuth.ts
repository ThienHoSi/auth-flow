import { clearAuthStorageValues } from '@/helper'
import { useRouter } from 'vue-router'

const useAuth = () => {
  const router = useRouter()

  const performLogout = () => {
    clearAuthStorageValues()
    router.push({ name: 'LoginPage' })
  }

  return { performLogout }
}

export default useAuth
