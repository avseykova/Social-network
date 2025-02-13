<script setup lang="ts">
import { ref } from "vue"

interface RegisterData {
  username: string
  email: string
  password: string
}

const username = ref<string>("")
const email = ref<string>("")
const password = ref<string>("")
const message = ref<string>("")
const isError = ref<boolean>(false)

const rules = {
  required: (v: string) => !!v || "This field is required",
  email: (v: string) => /.+@.+\..+/.test(v) || "Enter a valid email",
  minLength: (v: string) =>
    v.length >= 6 || "Password must be at least 6 characters",
  maxLength: (v: string) =>
    v.length <= 20 || "Password must be at most 20 characters",
}

const register = async (): Promise<void> => {
  message.value = ""
  isError.value = false

  try {
    const userData: RegisterData = {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    }

    const response = await fetch("http://localhost:5001/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    const data: { message?: string; error?: string } = await response.json()

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText} ${data.error}`)
    }

    message.value = data.message || "Registration successful!"
  } catch (error) {
    message.value = error instanceof Error ? error.message : "Network error"
    isError.value = true
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="300">
      <v-card-title class="text-center text-h5">Registration</v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="register">
          <v-text-field
            v-model="username"
            label="Username"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-account"
          />

          <v-text-field
            v-model="email"
            label="Email"
            :rules="[rules.required, rules.email]"
            prepend-inner-icon="mdi-email"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="[rules.required, rules.minLength]"
            prepend-inner-icon="mdi-lock"
          />

          <v-btn type="submit" block color="primary" class="mt-4">
            Register
          </v-btn>
        </v-form>

        <v-alert
          v-if="message"
          :type="isError ? 'error' : 'success'"
          class="mt-4"
        >
          {{ message }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
