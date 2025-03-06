<script setup lang="ts">
import { ref } from "vue";
import type { IUserRegister } from "../../models/userRegister.ts";
import type { IApiResponse } from "../../models/apiResponse.ts";
import { validationRules } from "../../utils/validationRules.ts";
import { strings } from "../../resources/strings.ts";
import { navigateTo } from "../../router/routerService";
import { Pages } from "../../utils/pages.ts";
import { API_BASE_URL } from "../../utils/constants.ts";
import axios from "axios";


const username = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);


const vOnRegister = async (): Promise<void> => {
  message.value = '';
  isError.value = false;

  try {
    const userData: IUserRegister = {
      username: username.value.trim(),
      email: email.value,
      password: password.value,
    };

    const response = await axios.post<IApiResponse>(`${API_BASE_URL}/register`, userData);

    message.value = response.data.message || strings.loginSuccess;
    setTimeout(() => navigateTo(Pages.Login), 500);

  } catch (error: any) {
    message.value = error.response?.data?.error || error.message || strings.networkError;
    isError.value = true;
    console.error("Ошибка регистрации:", error);
  }
};
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="300">
      <v-card-title class="text-center text-h5">Registration</v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="vOnRegister">
          <v-text-field
            v-model="username"
            label="Username"
            :rules="[validationRules.required, validationRules.maxLength]"
            prepend-inner-icon="mdi-account"
          />

          <v-text-field
            v-model="email"
            label="Email"
            :rules="[validationRules.required, validationRules.email, validationRules.maxLength]"
            prepend-inner-icon="mdi-email"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[validationRules.required, validationRules.minLength, validationRules.maxLength]"
            prepend-inner-icon="mdi-lock"
          />

          <v-btn class="mt-4" type="submit" block color="primary" >
            Register
          </v-btn>

          <router-link class="d-block text-center mt-4 text-primary text-decoration-none" :to="Pages.Login.path" >
            Login
          </router-link>

        </v-form>

        <v-alert class="mt-4" v-if="message" :type="isError ? 'error' : 'success'" >
          {{ message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
