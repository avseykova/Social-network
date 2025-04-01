<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { Pages } from "../utils/pages.ts";
import { navigateTo } from "../router/routerService.ts";
import { USER_KEY } from "../utils/constants.ts";
import { ref } from "vue";


const userId = ref<string | null>(localStorage.getItem(USER_KEY));
const auth = useAuthStore();


const vOnHandleLogout = () => {
  auth.logout();
  navigateTo(Pages.Login);
};
</script>

<template>
  <v-navigation-drawer app permanent class="custom-nav" width="200">
    <v-list dense>
      <v-list-item link @click="navigateTo(Pages.Home)">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-home</v-icon>
          <v-list-item-title class="ml-2">Feed</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="navigateTo(Pages.UserPage, { params: { id: userId } })">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-account</v-icon>
          <v-list-item-title class="ml-2">My Page</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="navigateTo(Pages.Chats)">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-chat</v-icon>
          <v-list-item-title class="ml-2">Messages</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="navigateTo(Pages.AllUsersPage)">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-account-group</v-icon>
          <v-list-item-title class="ml-2">Users</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="vOnHandleLogout">
            <v-list-item-content class="d-flex align-center">
              <v-icon>mdi-logout</v-icon>
              <v-list-item-title class="ml-2">Logout</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.custom-nav {
  
  background-color: white;
  border-right: 1px solid #ddd;
 
}
</style>
