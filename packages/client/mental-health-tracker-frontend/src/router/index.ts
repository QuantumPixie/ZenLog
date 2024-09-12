import { createRouter, createWebHistory } from 'vue-router'
import ZenLog from '../views/ZenLog.vue'
import MoodView from '../views/MoodView.vue'
import TheSignupLoginView from '../components/TheSignupLoginView.vue'
import HomeView from '../views/HomeView.vue'
import JournalView from '../views/JournalView.vue'
import UserManagement from '../components/UserManagement.vue'
import TheDashboard from '../components/TheDashboard.vue'
import ActivityView from '../views/ActivityView.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'ZenLog',
      component: ZenLog
    },
    {
      path: '/login-signup',
      name: 'login-signup',
      component: TheSignupLoginView
    },
    {
      path: '/home',
      name: 'Home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/mood',
      name: 'Mood',
      component: MoodView,
      meta: { requiresAuth: true }
    },
    {
      path: '/journal',
      name: 'Journal',
      component: JournalView,
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'Activities',
      component: ActivityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user-management',
      name: 'UserManagement',
      component: UserManagement,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: TheDashboard,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Allow access during testing
  if (import.meta.env.MODE === 'test') {
    next()
    return
  }

  // If the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if the user is already authenticated
    if (!authStore.isAuthenticated) {
      // Perform the async checkAuth to verify if the user is authenticated
      const isAuthenticated = await authStore.checkAuth()

      if (isAuthenticated) {
        next() // User is authenticated, allow access
      } else {
        next('/login-signup') // User is not authenticated, redirect to login/signup
      }
    } else {
      next() // User is already authenticated, allow access
    }
  } else {
    next() // Route does not require authentication, allow access
  }
})

export default router
