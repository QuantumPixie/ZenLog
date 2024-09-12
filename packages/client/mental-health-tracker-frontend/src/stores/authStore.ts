import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Router } from 'vue-router'
import { trpc } from '../utils/trpc'

interface User {
  id: number
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  function setUser(newUser: User | null) {
    user.value = newUser
  }

  async function login(email: string, password: string) {
    try {
      const result = await trpc.user.login.mutate({ email, password })
      user.value = result.user
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function signup(email: string, password: string, username: string) {
    try {
      const result = await trpc.user.signup.mutate({ email, password, username })
      user.value = result.user
      return true
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  async function logout(router: Router) {
    try {
      await trpc.user.logout.mutate()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      router.push('/')
    }
  }

  async function checkAuth() {
    try {
      const result = await trpc.user.getCurrentUser.query()
      user.value = result
      return true
    } catch (error) {
      // Handle 401 Unauthorized error gracefully
      if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
        console.log('User is not logged in')
      } else {
        console.error('Check auth error:', error)
      }
      user.value = null
      return false
    }
  }

  return { user, isAuthenticated, login, setUser, signup, logout, checkAuth }
})