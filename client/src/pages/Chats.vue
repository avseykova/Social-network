<script setup lang="ts">
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import { onMounted, shallowRef } from "vue";
import axios from "axios";
import { LOCALHOST } from "../utils/constants";
import type { IChat } from "../models/chat.ts";
import { useAuthStore } from "../stores/auth";

const chats = shallowRef<IChat[]>([]);
const loading = shallowRef<boolean>(true);
const auth = useAuthStore();

const vOnGoToDialogue = (chat: IChat) => {
  navigateTo(Pages.Messages, { params: { id: chat.receiver_id } });
};

const getChats = async () => {
  try {
    const response = await axios.post(`${LOCALHOST}/api/chats`, {
      user_id: auth.userId,
    });
    chats.value = response.data.chats;
  } catch (error: any) {
    console.error('Error:', error.response?.data?.error || error.message);
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
      No users found.
    </v-alert>
  </v-container>
</template>
