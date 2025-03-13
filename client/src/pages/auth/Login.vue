<script setup lang="ts">
import { ref } from "vue";
import { validationRules } from "../../utils/validationRules.ts";
import { strings } from "../../resources/strings.ts";
import { Pages } from "../../utils/pages.ts";
import { navigateTo } from "../../router/routerService";
import type { ILoginResponse } from "../../models/loginResponse.ts";
import { USER_KEY, API_BASE_URL } from "../../utils/constants.ts";
import axios from "axios";

const email = ref<string>('');
const password = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);


const vOnLogin = async (): Promise<void> => {
  message.value = '';
  isError.value = false;

  try {
    const response = await axios.post<ILoginResponse>(`${API_BASE_URL}/login`, {
      email: email.value,
      password: password.value
    });

    if (!response.data.user_id) {
      throw new Error(`Ошибка: ${response.data.error || "Неизвестная ошибка"} username: ${response.data.user_id}`);
    }

    message.value = response.data.message || strings.loginSuccess;
    setTimeout(() => navigateTo(Pages.UserPage, { params: { id: response.data.user_id } }), 500);
    localStorage.setItem(USER_KEY, response.data.user_id);
    console.log("Успешный вход:", response.data);

  } catch (error: any) {
    message.value = error.response?.data?.error || error.message || strings.networkError;
    isError.value = true;
    console.error("Ошибка входа:", error);
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

          <router-link class="d-block text-center mt-4 text-primary text-decoration-none" :to="Pages.Registration.path">
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
