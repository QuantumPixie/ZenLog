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
      <div class="feature-item">
        <i class="pi pi-heart feature-icon"></i>
        <h3>Mood Tracking</h3>
        <p>Log your daily moods and emotions to gain insights into your mental state.</p>
      </div>
      <div class="feature-item">
        <i class="pi pi-book feature-icon"></i>
        <h3>Journaling</h3>
        <p>Write down your thoughts and experiences to reflect on your journey.</p>
      </div>
      <div class="feature-item">
        <i class="pi pi-chart-line feature-icon"></i>
        <h3>Progress Visualization</h3>
        <p>View your mental health trends over time with easy-to-understand charts.</p>
      </div>
      <div class="feature-item">
        <i class="pi pi-user feature-icon"></i>
        <h3>Personalized Insights</h3>
        <p>Receive tailored recommendations based on your mood and journal entries.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

const navigateToSignup = () => {
  router.push({ name: 'login', query: { mode: 'signup' } })
}

const navigateToLogin = () => {
  router.push({ name: 'login', query: { mode: 'login' } })
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
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
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