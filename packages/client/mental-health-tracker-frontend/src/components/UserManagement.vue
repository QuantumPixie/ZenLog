<template>
  <div class="user-management-view">
    <div class="top-section">
      <div class="header-welcome">
        <h1 class="welcome-title">
          <span>User Management</span>
          <i class="pi pi-user custom-icon"></i>
        </h1>
        <ul class="welcome-message">
          <li>View and manage your user profile information.</li>
          <li>Update your password to keep your account secure.</li>
          <li>Keep your email address up to date for important notifications.</li>
          <li>Manage your account settings and preferences.</li>
        </ul>
      </div>
      <div class="user-info">
        <h2>Your Profile</h2>
        <div v-if="currentUser" class="p-fluid">
          <div class="field">
            <label>Username</label>
            <InputText :value="currentUser.username" disabled />
          </div>
          <div class="field">
            <label>Email</label>
            <InputText :value="currentUser.email" disabled />
          </div>
        </div>
      </div>
    </div>

    <div class="password-change-section">
      <h2>Change Password</h2>
      <form @submit.prevent="changeUserPassword" class="p-fluid">
        <div class="field">
          <label for="oldPassword">Old Password</label>
          <Password id="oldPassword" v-model="passwordChange.oldPassword" toggleMask />
        </div>
        <div class="field">
          <label for="newPassword">New Password</label>
          <Password id="newPassword" v-model="passwordChange.newPassword" toggleMask />
        </div>
        <Button type="submit" label="Change Password" class="p-button-raised p-button-rounded custom-button" />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trpc } from '../utils/trpc'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

interface User {
  username: string
  email: string
}

const toast = useToast()
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user information', life: 3000 })
  }
}

const changeUserPassword = async () => {
  try {
    await trpc.user.changePassword.mutate(passwordChange.value)
    toast.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully', life: 3000 })
    passwordChange.value = { oldPassword: '', newPassword: '' }
  } catch (error) {
    console.error('Failed to change password:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to change password', life: 3000 })
  }
}

onMounted(getCurrentUser)
</script>

<style scoped>
.user-management-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
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

.user-info {
  align-self: end;
  margin-top: 3rem;
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

.user-info, .password-change-section {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #1b968a;
}

.user-info h2, .password-change-section h2 {
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

.password-change-section {
  margin-top: 3rem;
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .user-info {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }
}
</style>