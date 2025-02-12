<script setup lang="ts">
import { ref } from "vue";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

const username = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const message = ref<string>("");

const register = async (): Promise<void> => {
  try {
    const userData: RegisterData = {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    };

    const response = await fetch("http://localhost:5001/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    const data: { message?: string; error?: string } = await response.json();
    message.value = data.message || "Регистрация успешна!";
  } catch (error) {
    message.value = error instanceof Error ? error.message : "Ошибка сети";
  }
};
</script>

<template>
  <div>
    <h2>Регистрация</h2>
    <input
      v-model="username"
      type="text"
      placeholder="Имя пользователя"
      required
    />
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Пароль" required />
    <button @click="register">Зарегистрироваться</button>
    <p>{{ message }}</p>
  </div>
</template>

<style>
input {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
}
button {
  padding: 8px;
  background: blue;
  color: white;
  cursor: pointer;
}
</style>
