<template>
  <div class="dashboard">
    <div class="header-welcome">
      <h1 class="welcome-title">
        <span>Welcome, {{ authStore.user?.username || 'Guest' }}!</span>
        <i class="pi pi-home custom-icon"></i>
      </h1>
      <p class="welcome-message">What would you like to do today?</p>
    </div>

    <div class="feature-grid">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="feature-item"
        @click="feature.action"
      >
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
  icon: string
  title: string
  description: string
  action: () => void
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
    title: 'Dashboard',
    description: 'View your overall progress and recent entries.',
    action: async () => {
      try {
        const summary = await trpc.dashboard.getSummary.query()
        console.log('Dashboard:', summary)
        router.push('/dashboard')
      } catch (error) {
        console.error('Failed to get dashboard summary:', error)
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
  padding: 1rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.header-welcome {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.custom-icon {
  color: #1b968a;
  margin-left: 0.5rem;
  font-size: 2rem;
}

.welcome-message {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: var(--text-color-secondary);
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
}

.feature-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #1b968a;
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 2rem;
  color: #1b968a;
  margin-bottom: 0.75rem;
}

.feature-item h3 {
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  color: var(--primary-color);
}

.feature-item p {
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

@media (min-width: 768px) {
  .dashboard {
    padding: 2rem;
  }

  .header-welcome {
    margin-bottom: 3rem;
  }

  .welcome-title {
    font-size: 3.3rem;
    margin-bottom: 1rem;
  }

  .custom-icon {
    margin-left: 1rem;
    font-size: 3.3rem;
  }

  .welcome-message {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }

  .feature-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .feature-item {
    padding: 2rem;
    border: 2px solid #1b968a;
  }

  .feature-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-item h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .feature-item p {
    font-size: 0.9rem;
  }
}
</style>
