import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: !!localStorage.getItem('auth_token'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),
  actions: {
    setAuth(isAuth: boolean, userData: User | null = null) {
      this.isAuthenticated = isAuth
      this.user = userData
      if (isAuth && userData) {
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        localStorage.removeItem('user')
      }
    },
    logout(router: Router) {
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      router.push('/login-signup')
    }
  }
})
