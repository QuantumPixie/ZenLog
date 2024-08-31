<template>
  <div class="login-signup-form">
    <h2>{{ isLoginMode ? 'Login' : 'Sign Up' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div v-if="!isLoginMode" class="form-group">
        <label for="username">Username</label>
        <InputText id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <Password id="password" v-model="password" :feedback="!isLoginMode" required toggleMask />
      </div>
      <Button type="submit" :label="isLoginMode ? 'Login' : 'Sign Up'" :loading="loading" class="w-full" />
    </form>
    <div class="mt-3 text-center">
      <a href="#" @click.prevent="toggleMode">
        {{ isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Login" }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { trpc } from '../utils/trpc';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const isLoginMode = ref(true);
const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  username.value = '';
  email.value = '';
  password.value = '';
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (isLoginMode.value) {
      const result = await trpc.user.login.mutate({
        email: email.value,
        password: password.value,
      });
      authStore.setAuth(true, result.user);
      localStorage.setItem('auth_token', result.token);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Logged in successfully', life: 3000 });
      router.push('/home');
    } else {
      const result = await trpc.user.signup.mutate({
        username: username.value,
        email: email.value,
        password: password.value,
      });
      toast.add({ severity: 'success', summary: 'Success', detail: 'Account created successfully', life: 3000 });
      isLoginMode.value = true;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: isLoginMode.value ? 'Failed to login' : 'Failed to create account', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-signup-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--surface-card);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.w-full {
  width: 100%;
}

.mt-3 {
  margin-top: 1rem;
}

.text-center {
  text-align: center;
}
</style>