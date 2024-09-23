<template>
  <div class="profile">
    <h2>User Profile</h2>
    <form @submit.prevent="updateProfile">
      <div class="p-fluid">
        <div class="field">
          <label for="username">Username</label>
          <InputText id="username" v-model="username" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <InputText id="email" v-model="email" type="email" required />
        </div>
        <Button type="submit" label="Update Profile" class="submit-button" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const username = ref('')
const email = ref('')

const updateProfile = () => {
  console.log('Profile updated:', username.value, email.value)
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

h2 {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  text-align: center;
}

.field {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--text-color);
}

:deep(.p-inputtext) {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}

.submit-button {
  width: 100%;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .profile {
    padding: 2rem;
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }

  .field {
    margin-bottom: 1.5rem;
  }

  label {
    margin-bottom: 0.75rem;
  }

  :deep(.p-inputtext) {
    padding: 0.75rem;
    font-size: 1.1rem;
  }

  .submit-button {
    width: auto;
    padding: 0.75rem 1.5rem;
    font-size: 1.1rem;
  }
}
</style>
