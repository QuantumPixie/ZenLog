<template>
  <div class="zen-log-view">
    <div class="header-welcome">
      <h1 class="welcome-title">
        <span>Welcome to ZenLog</span>
        <img alt="Mind Bloom Logo" :src="logoImage" class="welcome-logo" />
      </h1>
      <ul class="welcome-message">
        <li>Track your moods and journal your thoughts to improve your mental well-being.</li>
        <li>Gain insights into your emotional patterns and triggers.</li>
        <li>Take control of your mental health journey with our comprehensive tools.</li>
      </ul>
    </div>

    <div class="feature-grid">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="feature-item"
        @click="showFeatureDetails(feature)"
      >
        <i :class="['pi', feature.icon, 'feature-icon']"></i>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>

    <div class="cta-section">
      <h2>Ready to start your journey?</h2>
      <div class="cta-buttons">
        <Button
          label="Sign Up"
          icon="pi pi-user-plus"
          class="p-button-raised p-button-rounded custom-button"
          @click="navigateToSignup"
        />
        <Button
          label="Log In"
          icon="pi pi-sign-in"
          class="p-button-raised p-button-rounded custom-button"
          @click="navigateToLogin"
        />
      </div>
    </div>

    <Dialog
      v-model:visible="displayFeatureDialog"
      :header="selectedFeature.title"
      :modal="true"
      class="feature-dialog"
    >
      <template #default>
        <ul>
          <li v-for="(point, index) in selectedFeature.bulletPoints" :key="index">
            {{ point }}
          </li>
        </ul>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import logoImage from '@/assets/logo.webp'

interface Feature {
  icon: string
  title: string
  description: string
  bulletPoints: string[]
}

const router = useRouter()

const displayFeatureDialog = ref(false)
const selectedFeature = ref<Feature>({
  icon: '',
  title: '',
  description: '',
  bulletPoints: []
})

const features: Feature[] = [
  {
    icon: 'pi-bolt',
    title: 'Activity Tracking',
    description: 'Log your daily activities and see how they impact your mood.',
    bulletPoints: [
      'Record various types of activities (exercise, hobbies, social interactions, etc.)',
      'Track duration and intensity of activities',
      'Add notes to provide context for each activity',
      'Correlate activities with mood changes',
      'Identify activities that positively impact your mental health'
      // 'Receive suggestions for mood-boosting activities',
      // 'Set and track activity goals'
    ]
  },
  {
    icon: 'pi-heart',
    title: 'Mood Tracking',
    description: 'Log your daily moods and emotions to gain insights into your mental state.',
    bulletPoints: [
      'Easily log your emotional state throughout the day',
      'Select from a range of emotions',
      'Rate your overall mood',
      'Add notes about influencing factors',
      'Create a comprehensive picture of your emotional well-being',
      'Identify patterns, triggers, and areas for improvement'
    ]
  },
  {
    icon: 'pi-book',
    title: 'Journaling',
    description: 'Write down your thoughts and experiences to reflect on your journey.',
    bulletPoints: [
      'Safe and private space for self-expression',
      'Create entries of any length',
      // 'Attach entries to specific moods or events',
      'Automatic sentiment analysis of your entries',
      'Track emotional tone over time',
      'Gain insights into your thought patterns',
      'Promote self-reflection and emotional processing'
    ]
  },
  {
    icon: 'pi-chart-line',
    title: 'Progress Visualization',
    description: 'View your mental health trends over time with easy-to-understand charts.',
    bulletPoints: [
      'Transform your data into intuitive charts and graphs',
      'Track mood trends over time',
      // 'Correlate journal entries with emotional states',
      'Identify factors affecting your mental well-being',
      'Recognize improvements in your mental health',
      'Pinpoint areas that need attention'
    ]
  },
  {
    icon: 'pi-user',
    title: 'User Management',
    description: 'Manage your account settings and preferences.',
    bulletPoints: [
      // 'Update your personal information',
      'Change your password for enhanced security',
      // 'Customize your notification preferences',
      // 'Manage your privacy settings',
      // 'Control data sharing options',
      // 'Access and export your data',
      'Delete your account if needed'
    ]
  },
  {
    icon: 'pi-th-large',
    title: 'Dashboard',
    description: 'Get a comprehensive overview of your mental health journey.',
    bulletPoints: [
      'View a summary of your recent moods and activities and journal entries',
      // 'See your progress towards goals',
      // 'Get insights and recommendations based on your data',
      // 'Access quick links to frequently used features',
      // 'Customize your dashboard layout',
      'Set and track personal wellness goals',
      'Receive motivational messages and tips'
    ]
  }
]

const navigateToSignup = () => {
  router.push({ name: 'login-signup', query: { mode: 'signup' } })
}

const navigateToLogin = () => {
  router.push({ name: 'login-signup', query: { mode: 'login' } })
}

const showFeatureDetails = (feature: Feature) => {
  selectedFeature.value = feature
  displayFeatureDialog.value = true
}
</script>

<style scoped>
.zen-log-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.header-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.welcome-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #1b968a;
  object-fit: cover;
}

.welcome-message {
  font-size: 1rem;
  margin-bottom: 1rem;
  max-width: 100%;
  padding-left: 0;
  list-style-type: none;
}

.welcome-message li {
  margin-bottom: 0.5rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  margin-bottom: 2rem;
}

.feature-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid #1b968a;
}

.feature-icon {
  font-size: 2rem;
  color: #1b968a;
  margin-bottom: 0.5rem;
}

.feature-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
  color: var(--primary-color);
}

.feature-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.cta-section {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #1b968a;
  text-align: center;
  margin-top: 2rem;
}

.cta-section h2 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  margin-top: 0;
  font-size: 1.8rem;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.custom-button {
  background-color: #1b968a !important;
  border-color: #1b968a !important;
  font-size: 1rem !important;
  padding: 0.8rem 1.5rem !important;
  width: 100%;
  max-width: 250px;
}

:deep(.feature-dialog) {
  width: 95%;
  max-width: 500px;
  border-radius: 10px;
}

@media (min-width: 768px) {
  .zen-log-view {
    padding: 2rem;
  }

  .welcome-title {
    font-size: 3.3rem;
    gap: 1rem;
  }

  .welcome-logo {
    width: 80px;
    height: 80px;
  }

  .welcome-message {
    font-size: 1.2rem;
    padding-left: 1.5rem;
  }

  .feature-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .feature-item {
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-item h3 {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  .feature-item p {
    font-size: 1rem;
  }

  .cta-section {
    padding: 3rem;
    margin-top: 4rem;
  }

  .cta-section h2 {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }

  .cta-buttons {
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }

  .custom-button {
    font-size: 1.2rem !important;
    padding: 1rem 2rem !important;
    width: auto;
  }
}
</style>
