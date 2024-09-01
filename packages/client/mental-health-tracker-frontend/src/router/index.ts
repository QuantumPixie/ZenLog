import { createRouter, createWebHistory } from 'vue-router'
import ZenLog from '../views/ZenLog.vue'
import MoodView from '../views/MoodView.vue'
import TheSignupLoginView from '../components/TheSignupLoginView.vue';
import { useAuthStore } from '../stores/authStore'
import HomeView from '../views/HomeView.vue'
import TheJournal from '../components/TheJournal.vue'
import UserManagement from '../components/UserManagement.vue'
import TheDashboard from '../components/TheDashboard.vue'
import TheActivities from '../components/TheActivities.vue'

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
      component: TheJournal,
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'Activities',
      component: TheActivities,
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
    },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router