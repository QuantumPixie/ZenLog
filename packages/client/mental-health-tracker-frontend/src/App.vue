<template>
  <div id="app">
    <Toast />
    <header class="header">
      <Menubar :model="menuItems" class="custom-menubar">
        <template #start>
          <img
            alt="logo"
            src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
            height="40"
            class="mr-2 logo"
          >
        </template>
        <template #end>
          <Button
            v-if="!authStore.isAuthenticated"
            label="Login / Signup"
            icon="pi pi-user"
            @click="navigateToLoginSignup"
            class="p-button-raised p-button-rounded custom-button"
          />
          <Button
            v-else
            label="Logout"
            icon="pi pi-sign-out"
            @click="handleLogout"
            class="p-button-raised p-button-rounded custom-button"
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
    label: 'ZenLog',
    icon: 'pi pi-fw pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Home',
    icon: 'pi pi-fw pi-th-large',
    command: () => router.push('/home'),
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
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-chart-line',
    command: () => router.push('/dashboard'),
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
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.header {
  background-color: var(--surface-card);
  border-bottom: 2px solid #1b968a;
}

.custom-menubar {
  background-color: transparent !important;
  border: none !important;
  padding: 0.5rem 2rem;
}

.custom-menubar :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link .p-menuitem-text) {
  color: var(--primary-color) !important;
}

.custom-menubar :deep(.p-menuitem-link:hover) {
  background-color: white !important;
}

.custom-menubar :deep(.p-menuitem-link:hover .p-menuitem-text) {
  color: #333333 !important;
}

.custom-menubar :deep(.p-menuitem-icon) {
  color: #1b968a !important;
}

.logo {
  border-radius: 50%;
  border: 2px solid #1b968a;
}

.custom-button {
  background-color: #1b968a !important;
  border-color: #1b968a !important;
}

.custom-button:hover {
  background-color: #22b8a8 !important;
  border-color: #22b8a8 !important;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  margin-top: auto;
  padding: 1rem;
  text-align: center;
  background-color: var(--surface-card);
  border-top: 2px solid #1b968a;
}
</style>