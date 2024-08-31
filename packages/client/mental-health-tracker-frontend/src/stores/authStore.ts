import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

interface User {
  id: number;
  username: string;
  email: string;
  // Add other properties as needed
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    user: null
  }),
  actions: {
    setAuth(isAuth: boolean, userData: User | null = null) {
      this.isAuthenticated = isAuth
      this.user = userData
    },
    logout(router: Router) {
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem('auth_token')
      router.push('/')
    }
  }
})
