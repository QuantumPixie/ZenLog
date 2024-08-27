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
        <Button type="submit" label="Update Profile" />
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
  // Implement profile update logic here
  console.log('Profile updated:', username.value, email.value)
}
</script>