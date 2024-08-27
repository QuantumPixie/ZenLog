<template>
  <div class="app">
    <Menubar :model="items">
      <template #start>
        <img alt="logo" src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" height="40" class="mr-2">
      </template>
      <template #end>
      </template>
    </Menubar>

    <router-view></router-view>

    <div class="footer">
      © {{ new Date().getFullYear() }} ZenLog
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Menubar from 'primevue/menubar'

const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-fw pi-home',
    to: '/'
  },
  {
    label: 'Mood',
    icon: 'pi pi-fw pi-heart',
    to: '/mood'
  },
  {
    label: 'Journal',
    icon: 'pi pi-fw pi-book',
    to: '/journal'
  },
  {
    label: 'Profile',
    icon: 'pi pi-fw pi-user',
    to: '/profile'
  }
])
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.footer {
  margin-top: auto;
  padding: 1rem;
  text-align: center;
  background-color: var(--surface-ground);
}
</style>