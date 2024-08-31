<template>
  <div id="app">
    <Toast />
    <header>
      <Menubar :model="menuItems">
        <template #start>
          <img
            alt="logo"
            src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
            height="40"
            class="mr-2"
          >
        </template>
        <template #end>
          <Button
            v-if="!authStore.isAuthenticated"
            label="Login/Signup"
            icon="pi pi-user"
            @click="navigateToLoginSignup"
          />
          <Button
            v-else
            label="Logout" 
            icon="pi pi-sign-out"
            @click="handleLogout"
          />
        </template>
      </Menubar>
    </header>

    <main>
      <router-view></router-view>
    </main>

    <footer class="footer">
      © {{ new Date().getFullYear() }} ZenLog
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { trpc } from './utils/trpc'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = computed(() => [
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-th-large',
    command: () => router.push('/dashboard'),
    visible: authStore.isAuthenticated
  },
  {
    label: 'Mood',
    icon: 'pi pi-fw pi-heart',
    command: () => router.push('/mood'),
    visible: authStore.isAuthenticated
  },
  {
    label: 'Journal',
    icon: 'pi pi-fw pi-book',
    command: () => router.push('/journal'),
    visible: authStore.isAuthenticated
  },
  {
    label: 'Activities',
    icon: 'pi pi-fw pi-bolt',
    command: () => router.push('/activities'),
    visible: authStore.isAuthenticated
  },
  {
    label: 'User Management',
    icon: 'pi pi-fw pi-user',
    command: () => router.push('/user-management'),
    visible: authStore.isAuthenticated
  }
])

const navigateToLoginSignup = () => {
  router.push('/login-signup')
}

const handleLogout = () => {
  authStore.logout(router)
}

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    try {
      const user = await trpc.user.getCurrentUser.query()
      authStore.setAuth(true, user)
    } catch (error) {
      console.error('Error verifying token:', error)
      localStorage.removeItem('auth_token')
      authStore.setAuth(false, null)
    }
  }
})
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

.footer {
  margin-top: auto;
  padding: 1rem;
  text-align: center;
  background-color: var(--surface-ground);
}
</style>
