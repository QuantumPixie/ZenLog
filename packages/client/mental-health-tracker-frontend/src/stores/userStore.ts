import { defineStore } from 'pinia';
import { ref } from 'vue';

interface UserData {
  id: number;
  username: string;
  email: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserData | null>(null);
  const isAuthenticated = ref(false);

  function setUser(userData: UserData) {
    user.value = userData;
    isAuthenticated.value = true;
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
  }

  return { user, isAuthenticated, setUser, logout };
});