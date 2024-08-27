<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignup">
      <div class="form-group">
        <label for="username">Username</label>
        <InputText id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <Password id="password" v-model="password" toggleMask required />
      </div>
      <Button type="submit" label="Sign Up" :loading="loading" />
    </form>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { trpc } from '../utils/trpc';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

const router = useRouter();
const toast = useToast();

const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);

const handleSignup = async () => {
  loading.value = true;
  try {
    const result = await trpc.user.signup.mutate({
      username: username.value,
      email: email.value,
      password: password.value,
    });
    console.log('User signed up:', result);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Signup successful!', life: 3000 });
    router.push('/login');
  } catch (error) {
    console.error('Signup failed:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Signup failed. Please try again.', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}
</style>