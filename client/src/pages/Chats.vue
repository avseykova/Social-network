<script setup lang="ts">
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import { onMounted, ref, shallowRef } from "vue";
import axios from "axios";
import { LOCALHOST, USER_KEY } from "../utils/constants";
import type { IChat } from "../models/chat.ts";
import NavigationDrawer from "../components/NavigationDrawer.vue";

const chats = shallowRef<IChat[]>([]);
const loading = shallowRef<boolean>(true);
const userId = ref<string | null>(localStorage.getItem(USER_KEY));

const vOnGoToDialogue = (chat: IChat) => {
  navigateTo(Pages.Messages, { params: { id: chat.receiver_id } });
};

const getChats = async () => {
  try {
    const response = await axios.post(`${LOCALHOST}/chats`, {
      user_id: userId.value,
    });
    chats.value = response.data.chats;
  } catch (error: any) {
    console.error('Ошибка:', error.response?.data?.error || error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getChats();
});

</script>

<template>
  <v-container>
    <NavigationDrawer :userId="userId" />
    <v-row>
      <v-col v-for="(chat, index) in chats" :key="index" cols="12">
        <v-card
          class="pa-2 mb-2"
          style="cursor: pointer"
          @click="() => vOnGoToDialogue(chat)"
        >
          <v-row class="pa-0" align="center" no-gutters>
            <v-col class="pa-0" cols="auto">
              <v-img
                class="pa-0"
                :src="chat.avatar_url"
                height="50px"
                width="50px"
              />
            </v-col>
            <v-col class="pa-0">
              <v-card-title class="pa-0" style="margin: 0; padding-left: 8px">
                {{ chat.firstname }} {{ chat.surname }}
              </v-card-title>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-alert class="mt-4" v-if="!loading && chats.length === 0" type="warning">
      Пользователей не найдено.
    </v-alert>
  </v-container>
</template>
