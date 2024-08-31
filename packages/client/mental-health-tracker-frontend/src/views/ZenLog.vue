<template>
  <div class="home">
    <div class="top-section">
      <div class="header-welcome">
        <h1 class="welcome-title">Welcome to ZenLog</h1>
        <p class="welcome-message">Track your moods and journal your thoughts to improve your mental well-being.</p>
      </div>
      <div class="cta-section">
        <h2>Ready to start your journey?</h2>
        <div class="cta-buttons">
          <Button label="Sign Up" icon="pi pi-user-plus" @click="navigateToSignup" class="p-button-raised p-button-rounded custom-signup-button" />
          <Button label="Log In" icon="pi pi-sign-in" @click="navigateToLogin" class="p-button-raised p-button-rounded p-button-secondary" />
        </div>
      </div>
    </div>

    <div class="feature-grid">
      <div v-for="feature in features" :key="feature.title" class="feature-item" @click="showFeatureDetails(feature)">
        <i :class="['pi', feature.icon, 'feature-icon']"></i>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
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

interface Feature {
  icon: string;
  title: string;
  description: string;
  bulletPoints: string[];
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
      'Identify activities that positively impact your mental health',
      'Receive suggestions for mood-boosting activities',
      'Set and track activity goals'
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
      'Attach entries to specific moods or events',
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
      'Correlate journal entries with emotional states',
      'Identify factors affecting your mental well-being',
      'Recognize improvements in your mental health',
      'Pinpoint areas that need attention'
    ]
  },
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
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 15rem;
  margin-bottom: 5rem;
  align-items: start;
}

.header-welcome {
  display: flex;
  flex-direction: column;
}

.welcome-title {
  font-size: 3.3rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.welcome-message {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  max-width: 600px;
}

.cta-section {
  margin-top: 3rem;
  text-align: center;
  padding: 2rem;
  background-color: var(--surface-card);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cta-section h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  margin-top: 0rem;
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.custom-signup-button {
  background-color: #40E0D0 !important;
  border-color: #40E0D0 !important;
}

.custom-signup-button:hover {
  background-color: #3CCDC2 !important;
  border-color: #3CCDC2 !important;
}

:deep(.feature-dialog) {
  width: 90%;
  max-width: 400px;
  border-radius: 10px;
}

:deep(.feature-dialog .p-dialog-header) {
  background-color: #1a1a1a;
  color: #b19cd9;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

:deep(.feature-dialog .p-dialog-content) {
  background-color: #2a2a2a !important;
  color: #b19cd9 !important;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 1.5rem;
}

:deep(.feature-dialog ul) {
  list-style-type: none;
  padding-left: 0;
}

:deep(.feature-dialog li) {
  margin-bottom: 0.75rem;
  position: relative;
  padding-left: 1.5rem;
}

:deep(.feature-dialog li::before) {
  content: '•';
  color: #9370db !important;
  font-weight: bold;
  position: absolute;
  left: 0;
}

:deep(.feature-dialog .p-dialog-header-close) {
  color: #b19cd9 !important;
}

:deep(.feature-dialog .p-dialog-header-close:hover) {
  background-color: rgba(177, 156, 217, 0.1) !important;
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .cta-section {
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }

  .cta-buttons {
    flex-direction: row;
    justify-content: center;
  }

  .cta-buttons .p-button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .cta-buttons {
    flex-direction: column;
  }

  .cta-buttons .p-button {
    width: 100%;
  }
}
</style>
