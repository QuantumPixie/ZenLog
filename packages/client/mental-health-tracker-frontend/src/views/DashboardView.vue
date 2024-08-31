<template>
  <div class="dashboard">
    <h1 class="dashboard-title">Welcome, {{ authStore.user?.username }}!</h1>
    <p class="dashboard-subtitle">What would you like to do today?</p>

    <div class="feature-grid">
      <div v-for="feature in features" :key="feature.title" class="feature-item" @click="feature.action">
        <i :class="['pi', feature.icon, 'feature-icon']"></i>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { trpc } from '../utils/trpc'

interface Feature {
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

const router = useRouter()
const authStore = useAuthStore()

const features: Feature[] = [
  {
    icon: 'pi-heart',
    title: 'Mood',
    description: 'Log and view your moods.',
    action: () => router.push('/mood')
  },
  {
    icon: 'pi-book',
    title: 'Journal',
    description: 'Create and view journal entries.',
    action: () => router.push('/journal')
  },
  {
    icon: 'pi-bolt',
    title: 'Activities',
    description: 'Log and track your activities.',
    action: () => router.push('/activities')
  },
  {
    icon: 'pi-chart-line',
    title: 'Dashboard Summary',
    description: 'View your overall progress and recent entries.',
    action: async () => {
      try {
        const summary = await trpc.dashboard.getSummary.query()
        console.log('Dashboard summary:', summary)
        // You might want to navigate to a page that displays this summary
        router.push('/summary')
      } catch (error) {
        console.error('Failed to get dashboard summary:', error)
        // Handle error (show error message to user)
      }
    }
  },
  {
    icon: 'pi-user',
    title: 'User Management',
    description: 'Manage your account settings.',
    action: () => router.push('/user-management')
  }
]
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.dashboard-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.dashboard-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
}

.feature-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2rem;
  color: #40E0D0;
  margin-bottom: 1rem;
}

.feature-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.feature-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }

  .dashboard-subtitle {
    font-size: 1rem;
  }
}
</style>