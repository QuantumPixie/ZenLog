<template>
  <div class="login-signup-view">
    <div class="form-container">
      <div class="header-welcome">
        <h1 class="welcome-title">
          <span>{{ isLoginMode ? 'Login' : 'Sign Up' }}</span>
          <i class="pi pi-user-plus custom-icon"></i>
        </h1>
        <ul class="welcome-message">
          <li>
            {{
              isLoginMode
                ? 'Welcome back! Please login to access your account.'
                : 'Create an account to start tracking your mental health journey.'
            }}
          </li>
          <li>
            {{
              isLoginMode
                ? 'Securely access your personal dashboard and records.'
                : 'Join our community and take control of your well-being.'
            }}
          </li>
        </ul>
      </div>
      <div class="login-signup-form">
        <h2>{{ isLoginMode ? 'Login to Your Account' : 'Create Your Account' }}</h2>
        <form class="p-fluid" @submit.prevent="handleSubmit">
          <div v-if="!isLoginMode" class="field">
            <label for="username">Username</label>
            <InputText id="username" v-model="username" required data-testid="username-input" />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <InputText id="email" v-model="email" type="email" required data-testid="email-input" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              required
              toggle-mask
              input-class="w-full"
              data-testid="password-input-wrapper"
            />
          </div>
          <Button
            type="submit"
            :label="isLoginMode ? 'Login' : 'Sign Up'"
            :loading="loading"
            class="p-button-raised p-button-rounded custom-button"
            :data-testid="isLoginMode ? 'login-button' : 'signup-button'"
          />
        </form>
        <div class="mt-3 text-center">
          <a
            href="#"
            class="toggle-mode-link"
            :data-testid="isLoginMode ? 'create-account-link' : 'login-link'"
            @click.prevent="toggleMode"
          >
            {{ isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Login' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { trpc } from '../utils/trpc'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  username.value = ''
  email.value = ''
  password.value = ''
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isLoginMode.value) {
      const result = await trpc.user.login.mutate({
        email: email.value,
        password: password.value
      })
      authStore.setUser(result.user)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Logged in successfully',
        life: 3000
      })
      router.push('/home')
    } else {
      const result = await trpc.user.signup.mutate({
        username: username.value,
        email: email.value,
        password: password.value
      })
      authStore.setUser(result.user)
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Account created successfully',
        life: 3000
      })
      router.push('/home')
    }
  } catch (error) {
    console.error('Authentication error:', error)
    let errorMessage = 'An error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-signup-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 500px;
  gap: 12rem;
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
  display: flex;
  align-items: center;
}

.custom-icon {
  color: #1b968a;
  margin-left: 1rem;
  font-size: 3.3rem;
}

.welcome-message {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  max-width: 600px;
  padding-left: 1.5rem;
}

.welcome-message li {
  margin-bottom: 0.5rem;
}

.login-signup-form {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #1b968a;
}

.login-signup-form h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  margin-top: 0;
}

.field {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.custom-button {
  margin-top: 1rem;
  background-color: #1b968a !important;
  border-color: #1b968a !important;
}

.custom-button:hover {
  background-color: #22b8a8 !important;
  border-color: #22b8a8 !important;
}

.toggle-mode-link {
  color: var(--primary-color);
  text-decoration: none;
}

.toggle-mode-link:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .form-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }
}
</style>
