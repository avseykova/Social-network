import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { USER_KEY } from "../utils/constants";

export const useAuthStore = defineStore("auth", () => {
  const userId = ref<string | null>(localStorage.getItem(USER_KEY));

  const isAuthenticated = computed(() => !!userId.value);

  function login(id: string) {
    localStorage.setItem(USER_KEY, id);
    userId.value = id;
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    userId.value = null;
  }

  return {
    userId,
    isAuthenticated,
    login,
    logout,
  };
});
