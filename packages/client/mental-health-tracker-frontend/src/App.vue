<template>
  <div id="app">
    <Toast />
    <header class="header">
      <Menubar :model="menuItems" class="custom-menubar">
        <template #start>
          <img alt="Mind Bloom Logo" :src="logoImage" height="40" class="mr-2 logo" />
        </template>
        <template #end>
          <Button
            v-if="!authStore.isAuthenticated"
            label="Login / Signup"
            icon="pi pi-user"
            class="p-button-raised p-button-rounded custom-button"
            data-testid="header-login-signup-button"
            @click="navigateToLoginSignup"
          />
          <Button
            v-else
            label="Logout"
            icon="pi pi-sign-out"
            class="p-button-raised p-button-rounded custom-button"
            data-testid="header-logout-button"
            @click="handleLogout"
          />
        </template>
      </Menubar>
    </header>

    <main>
      <router-view></router-view>
    </main>

    <footer class="footer">© {{ new Date().getFullYear() }} ZenLog</footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import logoImage from '@/assets/logo.webp'

const router = useRouter()
const authStore = useAuthStore()

const authenticatedMenuItems = [
  {
    label: 'Home',
    icon: 'pi pi-fw pi-th-large',
    command: () => router.push('/home')
  },
  {
    label: 'Mood',
    icon: 'pi pi-fw pi-heart',
    command: () => router.push('/mood')
  },
  {
    label: 'Journal',
    icon: 'pi pi-fw pi-book',
    command: () => router.push('/journal')
  },
  {
    label: 'Activities',
    icon: 'pi pi-fw pi-bolt',
    command: () => router.push('/activities')
  },
  {
    label: 'User Management',
    icon: 'pi pi-fw pi-user',
    command: () => router.push('/user-management')
  },
  {
    label: 'Dashboard',
    icon: 'pi pi-fw pi-chart-line',
    command: () => router.push('/dashboard')
  }
]

const nonAuthenticatedMenuItems = [
  {
    label: 'ZenLog',
    icon: 'pi pi-fw pi-home',
    command: () => router.push('/')
  }
]

const menuItems = computed(() =>
  authStore.isAuthenticated
    ? [...nonAuthenticatedMenuItems, ...authenticatedMenuItems]
    : nonAuthenticatedMenuItems
)

const navigateToLoginSignup = () => {
  router.push('/login-signup')
}

const handleLogout = () => {
  authStore.logout(router)
}
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
  padding: 0.5rem 1rem;
}

.custom-menubar :deep(.p-menuitem-link:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.custom-menubar
  :deep(
    .p-menubar-root-list > .p-menuitem > .p-menuitem-content .p-menuitem-link .p-menuitem-text
  ) {
  color: var(--primary-color) !important;
}

.custom-menubar :deep(.p-menuitem-icon) {
  color: #1b968a !important;
}

.p-menubar
  .p-menubar-root-list
  > .p-menuitem
  > .p-menuitem-content
  .p-menuitem-link
  .p-menuitem-text {
  color: var(--primary-color);
}

.logo {
  border-radius: 50%;
  border: 2px solid #1b968a;
  max-height: 40px;
  width: auto;
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
  padding: 1rem;
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

@media (max-width: 768px) {
  .custom-menubar {
    padding: 0.5rem;
  }

  .custom-menubar :deep(.p-menubar-button) {
    margin-left: 0.5rem;
  }

  .custom-menubar :deep(.p-menubar-root-list) {
    padding: 0.5rem 0;
  }

  .custom-button {
    padding: 0.5rem !important;
  }

  .custom-button .p-button-label {
    display: none;
  }

  main {
    padding: 1rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .logo {
    max-height: 30px;
  }

  .custom-menubar {
    padding: 0.25rem;
  }

  .custom-button {
    padding: 0.25rem !important;
  }
}
</style>
