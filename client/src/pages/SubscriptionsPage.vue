<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Pages } from "../utils/pages.ts";
import { API_BASE_URL, DEFAULT_AVATAR, USER_KEY } from "../utils/constants.ts";
import { navigateTo as navigateTo } from "../router/routerService.ts";
import axios from "axios";
import { useRoute } from "vue-router";
import type { ISubscription } from "../models/subscription";
import NavigationDrawer from "../components/NavigationDrawer.vue";

const route = useRoute();
const userRecipient = ref<string | null>(route.params.id.toString());
const userId = ref<string | null>(localStorage.getItem(USER_KEY));
const subscriptionsCount = ref<number>(0);
const subscriptions = ref<ISubscription[]>([]);

const fetchSubscriptions = async (): Promise<void> => {
  try {
    if (!userRecipient.value) return;

    const response = await axios.get<{ subscriptions: ISubscription[] }>(
      `${API_BASE_URL}/subscriptions/${userRecipient.value}`
    );

    if (response.data) {
      subscriptions.value = response.data.subscriptions;
      subscriptionsCount.value = response.data.subscriptions.length;
    }
  } catch (error) {
    console.error('Ошибка загрузки подписчиков:', error);
  }
};

const vOnSubscribe = async (subscription: ISubscription): Promise<void> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/subscribe`, {
      userId: userId.value,
      pageId: subscription._id,
    });

    if (response.status == 200) {
      subscription.followers = response.data.followers;
    }
  } catch (error) {
    console.error('Ошибка подписки:', error);
  }
};

const vOnUnsubscribe = async (subscription: ISubscription): Promise<void> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/unsubscribe`, {
      userId: userId.value,
      pageId: subscription._id,
    });

    if (response.status == 200) {
      subscription.followers = response.data.followers;
    }
  } catch (error) {
    console.error('Ошибка подписки:', error);
  }
};

onMounted(() => {
  fetchSubscriptions();
});
</script>

<template>
  <v-container class="followers-page">
    <NavigationDrawer :userId="userId" />
    <v-card class="followers-card">
      <v-card-title class="text-h5 font-weight-bold text-center"
        >Подписки</v-card-title
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
        <v-list v-if="subscriptions.length > 0" class="pa-0">
          <v-list-item
            v-for="subscription in subscriptions"
            :key="subscription._id"
            class="follower-item"
          >
            <v-list-item-avatar size="4">
              <v-img :src="subscription.avatar_url || DEFAULT_AVATAR"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="text-subtitle-2 font-weight-medium">
                {{ subscription.firstname }} {{ subscription.surname }}
              </v-list-item-title>
            </v-list-item-content>

            <v-col cols="auto">
              <v-btn
                color="blue"
                @click="
                  () =>
                    subscription.followers.includes(userId!)
                      ? vOnUnsubscribe(subscription)
                      : vOnSubscribe(subscription)
                "
              >
                <v-icon v-if="subscription.followers.includes(userId!)"
                  >mdi-account-check</v-icon
                >
                <v-icon v-else>mdi-account-plus</v-icon>
                {{
                  subscription.followers.includes(userId!)
                    ? "Отписаться"
                    : "Подписаться"
                }}
              </v-btn>
            </v-col>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" class="mt-4 text-center">
          У пользователя пока нет подписок.
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
