<script setup lang="ts">
import { ref } from "vue";
import { API_BASE_URL } from "../../config/config.ts";
import { validationRules } from "../../utils/validationRules.ts";
import { strings } from "../../resources/strings.ts";
import { Pages } from "../../utils/pages.ts";
import { navigateTo } from "../../router/routerService";
import type { ILoginResponse } from "../../models/loginResponse.ts";
import { USER_KEY } from "../../utils/constants.ts";

const email = ref<string>('');
const password = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);


const vOnLogin = async (): Promise<void> => {
  message.value = '';
  isError.value = false;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const data: ILoginResponse = await response.json();

    if (!response.ok || !data.username) {
      throw new Error(`Error ${response.status}: ${response.statusText} ${data.error} username: ${data.username}`);
    }

    message.value = data.message || strings.loginSuccess;

    setTimeout(() => navigateTo(Pages.UserPage), 500);

    localStorage.setItem(USER_KEY, data.username!);

  } catch (error) {
    message.value = error instanceof Error ? error.message : strings.networkError;
    isError.value = true;
  }
};

</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="300">
      <v-card-title class="text-center text-h5">Login</v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="vOnLogin">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="[validationRules.required, validationRules.email]"
            prepend-inner-icon="mdi-email"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[validationRules.required]"
            prepend-inner-icon="mdi-lock"
          />

          <v-btn class="mt-4" type="submit" block color="primary" >
            Login
          </v-btn>

          <router-link :to="Pages.Registration.path" class="d-block text-center mt-4 text-primary text-decoration-none">
            Registration
          </router-link>

        </v-form>
        <v-alert class="mt-4" v-if="message" :type="isError ? 'error' : 'success'" >
          {{ message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
