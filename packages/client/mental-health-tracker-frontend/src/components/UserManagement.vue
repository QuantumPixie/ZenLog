<template>
    <div class="user-management-view">
      <h2>User Management</h2>
      <div v-if="currentUser">
        <p>Username: {{ currentUser.username }}</p>
        <p>Email: {{ currentUser.email }}</p>
      </div>
      <div class="change-password">
        <h3>Change Password</h3>
        <input v-model="passwordChange.oldPassword" type="password" placeholder="Old Password">
        <input v-model="passwordChange.newPassword" type="password" placeholder="New Password">
        <Button label="Change Password" @click="changeUserPassword" />
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { trpc } from '../utils/trpc'
  import Button from 'primevue/button'

  interface User {
  username: string
  email: string
}

  const currentUser = ref<User | null>(null)
  const passwordChange = ref({
    oldPassword: '',
    newPassword: ''
  })

  const getCurrentUser = async () => {
    try {
      currentUser.value = await trpc.user.getCurrentUser.query()
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  const changeUserPassword = async () => {
    try {
      await trpc.user.changePassword.mutate(passwordChange.value)
      alert('Password changed successfully')
      passwordChange.value = { oldPassword: '', newPassword: '' }
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('Failed to change password')
    }
  }

  onMounted(getCurrentUser)
  </script>