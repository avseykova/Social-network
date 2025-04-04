<script setup lang="ts">
import axios from "axios";
import type { IUser, IUsersResponse } from "../models/user.ts";
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import { ref, onMounted, computed } from "vue";

const users = ref<IUser[]>([]);
const loading = ref<boolean>(true);
const isEmpty = computed(() => !loading.value && users.value.length === 0);

const vOnGoToDialogue = (user: IUser) => { 
  navigateTo(Pages.Messages, { params: { id: user._id } });
};

const fetchUsers = async (): Promise<void> => {
  try {
    const response = await axios.get<IUsersResponse>('http://localhost:5004/api/users');
    
    if (response.data && Array.isArray(response.data.users)) {
      users.value = response.data.users;
    } else {
      users.value = [];
    }
  } catch (error) {
    console.error('Users loading error', error);
    users.value = [];
  } finally {
    loading.value = false;
  }
};

const vOnGoToUser = (user: IUser) => {
  navigateTo(Pages.UserPage, { params: { id: user._id } });
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <v-container class="fill-height d-flex align-start justify-start">
        <v-row>
          <v-col v-for="user in users" :key="user._id" sm="6" md="4">
            <v-card class="pa-2" style="position: relative" @click="vOnGoToUser(user)">
              <v-img :src="user.avatar_url" height="100px" />
              <v-card-title>{{ user.firstname }} {{ user.surname }}</v-card-title>
              <v-btn
                class="edit-btn"
                color="primary"
                icon
                @click.stop="vOnGoToDialogue(user)" 
                style="position: absolute; top: 16px; right: 16px"
              >
                <v-icon>mdi-message</v-icon>
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <v-alert class="mt-4" v-if="isEmpty" type="warning">
          No users found.
        </v-alert>
  </v-container>
</template>

