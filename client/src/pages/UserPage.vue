<script setup lang="ts">
import { ref, onMounted } from "vue";
import { API_BASE_URL } from "../config/config.ts";
import { strings } from "../resources/strings.ts";
import type { IUserInfoResponse } from '../models/userInfoResponse.ts';
import { USER_KEY } from "../utils/constants.ts";
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";

const name = ref<string>('');
const email = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);

const vOnhandleLogout = () => {
  localStorage.removeItem(USER_KEY);
  navigateTo(Pages.Login);
};

const fetchUser = async (): Promise<void> => {
  message.value = '';
  isError.value = false;

  try {
    const username: string | null = localStorage.getItem(USER_KEY);

    if (!username) {
      navigateTo(Pages.Login);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/user-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username }),
    });

    const data: IUserInfoResponse = await response.json();

    name.value = data.username;
    email.value = data.email;

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    message.value = strings.userPageLoaded;
  } catch (error) {
    message.value =
    error instanceof Error ? error.message : strings.networkError;
    isError.value = true;
  }
};

onMounted(() => {fetchUser()});
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="300">
      <v-card-title class="text-center text-h5">User Page</v-card-title>

      <v-card-text>
        <v-alert
          class="mb-4"
          v-if="message"
          :type="isError ? 'error' : 'success'">
          {{ message }}
        </v-alert>

        <div>
          <p><strong>Name:</strong> {{ name }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
        </div>

        <v-btn
          class="mt-4"
          type="submit"
          block
          color="primary"
          @click="vOnhandleLogout"
        >
          Logout
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>
