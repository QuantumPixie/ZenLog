import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MoodView from '../views/MoodView.vue'
import JournalView from '../views/JournalView.vue'
import ProfileView from '../views/ProfileView.vue'
import TheSignup from '../components/TheSignup.vue';
import TheLogin from '../components/TheLogin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/signup',
      name: 'signup',
      component: TheSignup
    },
    {
      path: '/login',
      name: 'login',
      component: TheLogin
    },
    {
      path: '/mood',
      name: 'mood',
      component: MoodView
    },
    {
      path: '/journal',
      name: 'journal',
      component: JournalView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    }
  ]
})

export default router