<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { io, Socket } from "socket.io-client";
import axios from "axios";

import SubscribeButton from "../components/SubscribeButton.vue";
import EditProfileDialog from "../components/EditProfileDialog.vue";
import PostCard from "../components/PostCard.vue";

import { strings } from "../resources/strings.ts";
import {
  DEFAULT_AVATAR,
  LOCALHOST,
  API_BASE_URL,
} from "../utils/constants.ts";
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import type { IPost } from "../models/userPost.ts";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const email = ref<string>('');
const dialog = ref<boolean>(false);
const avatarUrl = ref<string>(DEFAULT_AVATAR);
const firstname = ref<string>('');
const surname = ref<string>('');
const posts = ref<IPost[]>([]);
const subscriptions = ref<string[]>([]);
const newPostContent = ref<string>('');
const newPostImage = ref<File | null>(null);
const route = useRoute();
const userRecipient = ref<string | null>(route.params.id.toString());
const socket: Socket = io(LOCALHOST);
const itIsMe = computed(() => userRecipient.value === auth.userId);
const followersCount = ref<number>(0);
const subscriptionsCount = ref<number>(0);
const subscriptionsList = ref<any[]>([]);
const followers = ref<any[]>([]);

const vOnHandleOk = async (result: any) => {
  console.log(result.avatar);
  const newAvatarUrl = await uploadAvatar(result.avatar);
  await updateUserBD(result.firstname, result.surname, newAvatarUrl);
  await fetchUser();
  dialog.value = false;
};

const vOnAddPost = async () => {
  if (!newPostContent.value && !newPostImage.value) return;

  let imageUrl = '';
  if (newPostImage.value) {
    const formData = new FormData();
    formData.append('image', newPostImage.value);
    try {
      const uploadResponse = await axios.post<{ url: string }>(
        `${LOCALHOST}/api/upload`,
        formData
      );
      imageUrl = uploadResponse.data.url;
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
    }
  }

  try {
    const response = await axios.post<IPost>(`${API_BASE_URL}/posts`, {
      user_id: userRecipient.value,
      content: newPostContent.value,
      image_url: imageUrl,
    });

    posts.value.unshift(response.data);
    newPostContent.value = '';
    newPostImage.value = null;
  } catch (error) {
    console.error('Ошибка добавления поста:', error);
  }
};

const vOnDeletePost = async (postId: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/posts/${postId}`);
    posts.value = posts.value.filter((post) => post._id !== postId);
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
  }
};

const vOnHandleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length) {
    newPostImage.value = target.files[0];
  }
};

const fetchUser = async (): Promise<void> => {
  try {
    if (!userRecipient.value) {
      navigateTo(Pages.Login);
      return;
    }
    const response = await axios.post(`${API_BASE_URL}/user-info`, {
      user_id: userRecipient.value,
    });

    if (response.data) {
      firstname.value = response.data.firstname;
      surname.value = response.data.surname;
      email.value = response.data.email;
      avatarUrl.value = response.data.avatarUrl || '';
      subscriptions.value = response.data.subscriptions;
      subscriptionsList.value = response.data.subscriptions || [];
      followers.value = response.data.followers;
      followersCount.value = response.data.followers?.length || 0;
      subscriptionsCount.value = response.data.subscriptions?.length || 0;
    }

    console.log(strings.userPageLoaded);
  } catch (error) {
    console.log(error instanceof Error ? error.message : strings.networkError);
  }
};

const updateUserBD = async (
  newFirstname: string | null,
  newSurname: string | null,
  newAvatarUrl: string | null
) => {
  try {
    const response = await axios.put(`${LOCALHOST}/api/updateuser`, {
      user_id: auth.userId,
      firstname: newFirstname || firstname.value,
      surname: newSurname || surname.value,
      avatarUrl: newAvatarUrl || avatarUrl.value,
    });

    console.log('Аватар успешно обновлён:', response.data.message);
  } catch (error: any) {
    console.error('Ошибка:', error.response?.data?.error || error.message);
  }
};
const uploadAvatar = async (
  selectedFile: File | null
): Promise<string | null> => {
  if (!selectedFile) return null;

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const response = await axios.post(`${LOCALHOST}/api/upload`, formData);
    return `${LOCALHOST}${response.data.url}`;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return null;
  }
};

const vOnLikePost = async (post: IPost) => {
  try {
    console.log("sadsad", auth.userId);
    await axios.put(`${API_BASE_URL}/posts/like`, {
      user_id: auth.userId, 
      postId: post._id,
    });
  } catch (error) {
    console.error('Ошибка при лайке поста:', error);
  }
};

const fetchPosts = async (userId: string | null) => {
  if (!userId) return;

  try {
    const response = await axios.get<IPost[]>(
      `${API_BASE_URL}/posts/${userId}`
    );
    posts.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки постов:', error);
  }
};

const vOnSubscribe = async () => {
  try {
    const response = await axios.put(`${API_BASE_URL}/subscribe`, {
      userId: auth.userId,
      pageId: userRecipient.value,
    });

    followers.value = response.data.followers || [];
    subscriptions.value = response.data.subscriptions || [];

    subscriptionsCount.value = subscriptions.value.length;
    followersCount.value = followers.value.length;
  } catch (error) {
    console.error('Ошибка подписки:', error);
  }
};
const vOnGoToDialogue = () => {
  navigateTo(Pages.Messages, { params: { id: userRecipient.value } });
};

onBeforeRouteUpdate((to, from) => {
  if (to.params.id !== from.params.id) {
    reloadPage(to.params.id.toString());
  }
});

onMounted(() => {
  let route = useRoute();
  reloadPage(route.params.id.toString());
});

const reloadPage = (userId: string | null) => {
  userRecipient.value = userId;
  fetchUser();
  fetchPosts(userRecipient.value);
  pageRoom();
  socket.on('postUpdate', async (post: IPost) => {
    console.log(post)
    const index = posts.value.findIndex((p) => p._id === post._id);
    if (index !== -1) {
      posts.value[index] = post;
    }
  });
};

const pageRoom = (): void => {
  if (userRecipient.value) {
    socket.emit('pageRoom', userRecipient.value);
  }
};
</script>

<template>
  <v-container class="fill-height d-flex">
    <v-container
      class="flex-grow-1 d-flex flex-column align-center justify-center ml-6"
    >
      <v-card class="pa-6 w-75">
        <v-card-title class="text-center text-h5"
          >{{ firstname }} {{ surname }}</v-card-title
        >
        <v-card-text class="d-flex flex-column align-center">
          <v-hover v-slot:default="{ isHovering, props }">
            <div class="image-container" v-bind="props">
              <v-img
                class="rounded"
                :src="avatarUrl"
                height="200"
                width="300"
                cover
              >
                <v-fade-transition v-if="itIsMe">
                  <v-btn
                    class="edit-btn"
                    v-if="isHovering"
                    color="primary"
                    icon
                    @click="dialog = true"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-fade-transition>
              </v-img>
            </div>
          </v-hover>
        </v-card-text>
        <v-card-text v-model="subscriptions">
          <p><strong>Name:</strong> {{ firstname }}</p>
          <p><strong>Surname:</strong> {{ surname }}</p>
          <p><strong>Email:</strong> {{ email }}</p>

          <v-row class="mt-2 align-center">
            <v-col cols="auto">
              <v-btn
                color="blue"
                @click="
                  navigateTo(Pages.SubscriptionsPage, {
                    params: { id: userRecipient },
                  })
                "
              >
                <v-icon left>mdi-account-multiple</v-icon>
                Подписки: {{ subscriptionsCount }}
              </v-btn>
            </v-col>

            <v-col cols="auto">
              <v-btn
                color="green"
                @click="
                  navigateTo(Pages.FollowersPage, {
                    params: { id: userRecipient },
                  })
                "
              >
                <v-icon left>mdi-account-heart</v-icon>
                Подписчики: {{ followersCount }}
              </v-btn>
            </v-col>

            <v-col cols="auto">
              <SubscribeButton
                v-if="!itIsMe"
                :isSubscribed="followers.includes(auth.userId!)"
                @toggleSubscribe="vOnSubscribe"
              />
            </v-col>
          </v-row>

          <v-btn
            v-if="!itIsMe"
            class="edit-btn"
            color="primary"
            icon
            @click="vOnGoToDialogue"
            style="position: absolute; top: 16px; right: 16px"
          >
            <v-icon>mdi-message</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>

      <EditProfileDialog
        v-if="itIsMe"
        v-model:dialog="dialog"
        :user="{ firstname: firstname, surname: surname, avatarUrl: avatarUrl }"
        @save="vOnHandleOk"
      />

      <v-card v-if="itIsMe" class="pa-4 mt-4 w-75">
        <v-card-title>Создать пост</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="newPostContent"
            label="Введите текст"
          ></v-textarea>
          <v-file-input
            accept="image/*"
            label="Добавить изображение"
            @change="vOnHandleFileChange"
          ></v-file-input>
          <v-btn color="primary" @click="vOnAddPost">Опубликовать</v-btn>
        </v-card-text>
      </v-card>

      <v-list class="mt-4 w-75">
        <PostCard
          v-for="(post, index) in posts"
          :key="index"
          :post="post"
          :isOwner="itIsMe"
          @likePost="vOnLikePost"
          @deletePost="vOnDeletePost"
        />
      </v-list>
    </v-container>
  </v-container>
</template>

<style scoped>
.custom-nav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: white;
  border-right: 1px solid #ddd;
  z-index: 1000;
}
</style>
