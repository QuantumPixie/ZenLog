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
      <form class="p-fluid" @submit.prevent="changeUserPassword">
        <div class="field">
          <label for="oldPassword">Old Password</label>
          <Password id="oldPassword" v-model="passwordChange.oldPassword" toggle-mask />
        </div>
        <div class="field">
          <label for="newPassword">New Password</label>
          <Password id="newPassword" v-model="passwordChange.newPassword" toggle-mask />
        </div>
        <Button
          type="submit"
          label="Change Password"
          class="p-button-raised p-button-rounded custom-button"
        />
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
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch user information',
      life: 3000
    })
  }
}

const changeUserPassword = async () => {
  try {
    await trpc.user.changePassword.mutate(passwordChange.value)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password changed successfully',
      life: 3000
    })
    passwordChange.value = { oldPassword: '', newPassword: '' }
  } catch (error) {
    console.error('Failed to change password:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to change password',
      life: 3000
    })
  }
}

onMounted(getCurrentUser)
</script>

<style scoped>
.user-management-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.header-welcome {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.custom-icon {
  color: #1b968a;
  margin-left: 0.5rem;
  font-size: 2.5rem;
}

.welcome-message {
  font-size: 1rem;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.welcome-message li {
  margin-bottom: 0.5rem;
}

.user-info,
.password-change-section {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #1b968a;
}

.user-info h2,
.password-change-section h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  margin-top: 0;
  font-size: 1.5rem;
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

@media (min-width: 768px) {
  .user-management-view {
    padding: 2rem;
  }

  .top-section {
    flex-direction: row;
    gap: 4rem;
    align-items: flex-start;
  }

  .welcome-title {
    font-size: 3rem;
  }

  .custom-icon {
    font-size: 3rem;
  }

  .welcome-message {
    font-size: 1.2rem;
  }

  .user-info,
  .password-change-section {
    padding: 2rem;
  }

  .user-info {
    flex: 1;
  }

  .password-change-section {
    flex-basis: 400px;
  }
}

@media (min-width: 1024px) {
  .top-section {
    gap: 6rem;
  }

  .welcome-title {
    font-size: 3.3rem;
  }

  .custom-icon {
    font-size: 3.3rem;
  }

  .user-info,
  .password-change-section {
    border: 2px solid #1b968a;
  }
}
</style>
