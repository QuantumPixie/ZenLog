import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import router from './router'
import PrimeVue from 'primevue/config'
import { useAuthStore } from './stores/authStore'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import './assets/theme.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.component('PrimeToast', Toast)

const authStore = useAuthStore()

// Wait for the router to be ready before mounting the app
router.isReady().then(async () => {
  // Check authentication status before each route change
  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

    if (requiresAuth && !authStore.isAuthenticated) {
      const authCheck = await authStore.checkAuth()
      if (!authCheck) {
        // Redirect to login page or landing page if not authenticated
        return next('/')
      }
    }
    next()
  })

  app.mount('#app')
})
