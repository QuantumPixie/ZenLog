import { useAuthStore } from '../stores/authStore'
import { trpc } from '../utils/trpc'

export async function initializeAuth() {
  const authStore = useAuthStore()
  const token = localStorage.getItem('auth_token')

  if (token) {
    try {
      const user = await trpc.user.getCurrentUser.query()
      authStore.setAuth(true, user)
    } catch {
      localStorage.removeItem('auth_token')
      authStore.setAuth(false, null)
    }
  }
}