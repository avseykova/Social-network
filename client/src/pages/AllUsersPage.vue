<script setup lang="ts">
import type { IUser } from "../models/user.ts";
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import { ref, onMounted } from "vue";

const users = ref<IUser[]>([]);
const loading = ref<boolean>(true);

const vOnGoToDialogue = (user: IUser) => {
  navigateTo(Pages.Messages, { params: { id: user._id } });
};

const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:5004/users');
    if (response.ok) {
      users.value = await response.json();
    } else {
      console.error('Ошибка получения пользователей');
    }
  } catch (error) {
    console.error('Ошибка запроса пользователей', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});

</script>

<template>
  <v-container>
    <v-row>
      <v-col v-for="user in users" :key="user.username" sm="6" md="4">
        <v-card class="pa-2" style="position: relative"  @click="() => navigateTo(Pages.UserPage, { params: { id: user._id } })">
          <v-img :src="user.avatar_url" height="100px" />
          <v-card-title>{{ user.firstname }} {{ user.surname }}</v-card-title>
          <v-btn
            class="edit-btn"
            color="primary"
            icon
            @click.stop="() => vOnGoToDialogue(user)"
            style="position: absolute; top: 16px; right: 16px"
          >
            <v-icon>mdi-message</v-icon>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-alert class="mt-4" v-if="!loading && users.length === 0" type="warning">
      Пользователей не найдено.
    </v-alert>
  </v-container>
</template>
