import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TheMood from '../components/TheMood.vue'
import TheSignupLoginView from '../components/TheSignupLoginView.vue';
import { useAuthStore } from '../stores/authStore'
import DashboardView from '../views/DashboardView.vue'
import TheJournal from '../components/TheJournal.vue'
import UserManagement from '../components/UserManagement.vue'
import TheSummary from '../components/TheSummary.vue'
import TheActivities from '../components/TheActivities.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login-signup',
      name: 'login-signup',
      component: TheSignupLoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/mood',
      name: 'Mood',
      component: TheMood,
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
      path: '/summary',
      name: 'Summary',
      component: TheSummary,
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