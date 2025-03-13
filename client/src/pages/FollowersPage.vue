<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Pages } from "../utils/pages.ts";
import { API_BASE_URL, DEFAULT_AVATAR, USER_KEY } from "../utils/constants.ts";
import { navigateTo as navigateTo } from "../router/routerService.ts";
import axios from "axios";
import { useRoute } from "vue-router";
import type { IFollower, IFollowersResponse } from "../models/follower.ts";
import NavigationDrawer from "../components/NavigationDrawer.vue";

const route = useRoute();
const userRecipient = ref<string | null>(route.params.id.toString());
const followersCount = ref<number>(0);
const followers = ref<IFollower[]>([]);
const userId = ref<string | null>(localStorage.getItem(USER_KEY));

const fetchFollowers = async (): Promise<void> => {
  try {
    if (!userRecipient.value) return;

    const response = await axios.get<IFollowersResponse>(
      `${API_BASE_URL}/followers/${userRecipient.value}`
    );

    if (response.data) {
      followers.value = response.data.followers;
      followersCount.value = response.data.followers.length;
    }
  } catch (error) {
    console.error('Ошибка загрузки подписчиков:', error);
  }
};

const vOnSubscribe = async (folower: IFollower): Promise<void> => {
  try {
    const response = await axios.put<{ followers: string[] }>(
      `${API_BASE_URL}/subscribe`,
      {
        userId: userId.value,
        pageId: folower._id,
      }
    );

    if (response.status == 200) {
      folower.followers = response.data.followers;
    }
  } catch (error) {
    console.error('Ошибка подписки:', error);
  }
};

const vOnUnsubscribe = async (follower: IFollower): Promise<void> => {
  try {
    const response = await axios.put<{ followers: string[] }>(
      `${API_BASE_URL}/unsubscribe`,
      {
        userId: userId.value,
        pageId: follower._id,
      }
    );

    if (response.status == 200) {
      follower.followers = response.data.followers;
    }
  } catch (error) {
    console.error('Ошибка подписки:', error);
  }
};

onMounted(() => {
  fetchFollowers();
});
</script>

<template>
  <v-container class="followers-page">
    <NavigationDrawer :userId="userId" />
    <v-card class="followers-card">
      <v-card-title class="text-h5 font-weight-bold text-center"
        >Подписчики</v-card-title
      >
      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          @click="navigateTo(Pages.UserPage, { params: { id: userRecipient } })"
        >
          <v-icon left>mdi-arrow-left</v-icon> Назад
        </v-btn>
      </v-card-actions>
      <v-divider></v-divider>
      <v-card-text>
        <v-list v-if="followers.length > 0" class="pa-0">
          <v-list-item
            v-for="follower in followers"
            :key="follower._id"
            class="follower-item"
          >
            <v-list-item-avatar size="4">
              <v-img :src="follower.avatar_url || DEFAULT_AVATAR"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="text-subtitle-2 font-weight-medium">
                {{ follower.firstname }} {{ follower.surname }}
              </v-list-item-title>
            </v-list-item-content>
            <v-col cols="auto">
              <v-btn
                color="blue"
                @click="
                  () =>
                    follower.followers.includes(userId!)
                      ? vOnUnsubscribe(follower)
                      : vOnSubscribe(follower)
                "
              >
                <v-icon v-if="follower.followers.includes(userId!)"
                  >mdi-account-check</v-icon
                >
                <v-icon v-else>mdi-account-plus</v-icon>
                {{
                  follower.followers.includes(userId!)
                    ? "Отписаться"
                    : "Подписаться"
                }}
              </v-btn>
            </v-col>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" class="mt-4 text-center">
          У пользователя пока нет подписчиков.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.followers-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}
.followers-card {
  max-width: 400px;
  width: 100%;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: white;
}
.follower-item {
  padding: 5px 10px;
  transition: background-color 0.3s ease-in-out;
}
.follower-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
.v-list-item-avatar {
  width: 40px !important;
  height: 40px !important;
}
.v-list-item-title {
  font-size: 14px;
}
.v-alert {
  margin-top: 10px;
}
</style>
