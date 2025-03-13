<script setup lang="ts">
import { Pages } from "../utils/pages.ts";
import { navigateTo } from "../router/routerService.ts";
import { defineProps } from "vue";
import { USER_KEY } from "../utils/constants.ts";

const props = defineProps<{
  userId: string | null;
}>();

const vOnHandleLogout = () => {
  localStorage.removeItem(USER_KEY);
  navigateTo(Pages.Login);
};
</script>

<template>
  <v-navigation-drawer app permanent class="custom-nav" width="200">
    <v-list dense>
      <v-list-item link @click="navigateTo(Pages.Home)">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-home</v-icon>
          <v-list-item-title class="ml-2">Лента</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="navigateTo(Pages.UserPage, { params: { id: userId } })">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-account</v-icon>
          <v-list-item-title class="ml-2">Моя страница</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="navigateTo(Pages.Chats)">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-chat</v-icon>
          <v-list-item-title class="ml-2">Сообщения</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="navigateTo(Pages.AllUsersPage)">
        <v-list-item-content class="d-flex align-center">
          <v-icon>mdi-account-group</v-icon>
          <v-list-item-title class="ml-2">Пользователи</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item link @click="vOnHandleLogout">
            <v-list-item-content class="d-flex align-center">
              <v-icon>mdi-logout</v-icon>
              <v-list-item-title class="ml-2">Выйти</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.custom-nav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #ddd;
  z-index: 1000;
}
</style>
