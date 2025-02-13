<script setup lang="ts">
import { ref } from "vue";
import { API_BASE_URL } from "../../config/config.ts";
import type { IUserRegister } from "@/types/user.ts";
import type { IApiResponse } from "@/types/api.ts";

const username = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 20;

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email',
  minLength: (v: string) =>
    v.length >= PASSWORD_MIN_LENGTH ||
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  maxLength: (v: string) =>
    v.length <= PASSWORD_MAX_LENGTH ||
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
};

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

    message.value = data.message || 'Registration successful!';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Network error';
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
            :rules="[rules.required, rules.maxLength]"
            prepend-inner-icon="mdi-account"
          />

          <v-text-field
            v-model="email"
            label="Email"
            :rules="[rules.required, rules.email, rules.maxLength]"
            prepend-inner-icon="mdi-email"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required, rules.minLength, rules.maxLength]"
            prepend-inner-icon="mdi-lock"
          />

          <v-btn type="submit" block color="primary" class="mt-4">
            Register
          </v-btn>
        </v-form>

        <v-alert v-if="message" :type="isError ? 'error' : 'success'" class="mt-4">
          {{ message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
