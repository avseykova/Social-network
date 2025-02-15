<script setup lang="ts">
import { ref } from "vue";
import { API_BASE_URL } from "../../config/config.ts";
import type { IUserRegister } from "@/models/userRegister.ts";
import type { IApiResponse } from "@/models/apiResponse.ts";
import { validationRules } from "../../utils/validationRules.ts";
import { strings } from "../../resources/strings.ts";


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

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data: IApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        `Error ${response.status}: ${response.statusText} ${data.error}`
      );
    }

    message.value = data.message || strings.loginSuccess;
  } catch (error) {
    message.value = error instanceof Error ? error.message : strings.networkError;
    isError.value = true;
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
        </v-form>

        <v-alert class="mt-4" v-if="message" :type="isError ? 'error' : 'success'" >
          {{ message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
