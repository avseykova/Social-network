<script setup lang="ts">
import LikeButton from "../components/LikeButton.vue";
import NavigationDrawer from "../components/NavigationDrawer.vue";
import { ref, onMounted } from "vue";
import { strings } from "../resources/strings.ts";
import { onBeforeRouteUpdate } from "vue-router";
import {
  DEFAULT_AVATAR,
  USER_KEY,
  LOCALHOST,
  API_BASE_URL,
} from "../utils/constants.ts";
import { navigateTo as navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import axios from "axios";
import type { IPost } from "../models/userPost.ts";
import { io, Socket } from 'socket.io-client';
import { useRoute } from 'vue-router';

const email = ref<string>('');
const dialog = ref<boolean>(false);
const avatarUrl = ref<string>(DEFAULT_AVATAR);
const newAvatarUrl = ref<string>('');
const selectedFile = ref<File | null>(null);
const firstname = ref<string>('');
const newFirstname = ref<string>('');
const surname = ref<string>('');
const newSurname = ref<string>('');
const posts = ref<IPost[]>([]);
const subscriptions = ref<string[]>([]);
const newPostContent = ref('');
const newPostImage = ref<File | null>(null);
const route = useRoute();
const userRecipient = ref<string | null>(route.params.id.toString());
const userId = ref<string | null>(localStorage.getItem(USER_KEY));
const socket: Socket = io(LOCALHOST);
const itIsMe = ref<boolean>(userRecipient.value == localStorage.getItem(USER_KEY));
const followersCount = ref<number>(0);
const subscriptionsCount = ref<number>(0);
const subscriptionsList = ref<any[]>([]); 
const followers = ref<any[]>([]); 


const vOnhandleOk = async () => {
  await uploadAvatar();
  await updateUserBD();
  await fetchUser();
  dialog.value = false;
};


const vOnaddPost = async () => {
  if (!newPostContent.value && !newPostImage.value) return;

  let imageUrl = '';
  if (newPostImage.value) {
    const formData = new FormData();
    formData.append('image', newPostImage.value);
    try {
      const uploadResponse = await axios.post<{ url: string }>(
        `${LOCALHOST}/upload`,
        formData);
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

const vOndeletePost = async (postId: string) => {
  try {
    await axios.delete(`${API_BASE_URL}/posts/${postId}`);
    posts.value = posts.value.filter((post) => post._id !== postId);
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
  }
};

const vOnhandleFileChange = (event: Event) => {
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
    const response = await axios.post(
      `${API_BASE_URL}/user-info`,
      { user_id :userRecipient.value  }
    );

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

    console.log(strings.userPageLoaded)
  } catch (error) {
    console.log(error instanceof Error ? error.message : strings.networkError)
  }
};

const updateUserBD = async () => {
  try {

    const response = await axios.put(`${LOCALHOST}/updateuser`, {
      user_id: localStorage.getItem(USER_KEY),
      firstname: newFirstname.value || firstname.value,
      surname: newSurname.value || surname.value,
      avatarUrl: newAvatarUrl.value || avatarUrl.value,
    });

    console.log('Аватар успешно обновлён:', response.data.message);
  } catch (error: any) {
    console.error('Ошибка:', error.response?.data?.error || error.message);
  }
};

const vOnFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const uploadAvatar = async () => {
  if (!selectedFile.value) return;


  const formData = new FormData();
  formData.append('image', selectedFile.value);

  try {
    const response = await axios.post(
      `${LOCALHOST}/upload`,
      formData
    );

    newAvatarUrl.value = `${LOCALHOST}${response.data.url}`;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  } finally {
  }
};


const vOnlikePost = async (post: IPost) => {
  try {
     await axios.put(`${API_BASE_URL}/posts/like`, {
      user_id: post.user_id._id,
      postId: post._id,
    });

  } catch (error) {
    console.error('Ошибка при лайке поста:', error);
  }
};

const fetchPosts = async (userId: string | null) => {
  if (!userId) return;

  try {
    const response = await axios.get<IPost[]>(`${API_BASE_URL}/posts/${userId}`);
    posts.value = response.data;
  } catch (error) {
    console.error('Ошибка загрузки постов:', error);
  }
};

const vOnSubscribe = async () => {
  try {
    console.log(userId.value,userRecipient.value)
    const response = await axios.put(`${API_BASE_URL}/subscribe`, {
      userId: userId.value,
      pageId: userRecipient.value,
    });
    

    followers.value = response.data.followers || [];
    subscriptions.value = response.data.subscriptions || [];
    

    subscriptionsCount.value = subscriptions.value.length;
    followersCount.value = followers.value.length;
   

  } catch (error) {
    console.error("Ошибка подписки:", error);
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
  itIsMe.value = userRecipient.value == localStorage.getItem(USER_KEY)
  fetchUser();
  fetchPosts(userRecipient.value);
  pageRoom();
  socket.on('postUpdate', async (post: IPost) => {
    const index = posts.value.findIndex(p => p._id === post._id);
    if (index !== -1) {
      posts.value[index] = post; 
    }
  });
}

const pageRoom = (): void => {
  if (userRecipient.value) {
    socket.emit('pageRoom', userRecipient.value);
  }
};

</script>

<template>
  <v-container class="fill-height d-flex">
    <NavigationDrawer :userId="userId" />

    <v-container
      class="flex-grow-1 d-flex flex-column align-center justify-center ml-6"
    >
      <v-card class="pa-6 w-75">
        <v-card-title class="text-center text-h5"
          >{{ firstname }} {{ surname }}</v-card-title
        >
        
        <v-card-text class="d-flex flex-column align-center">
          <v-hover v-slot:default="{ isHovering, props }">
            <div  class="image-container" v-bind="props">
              <v-img
                class="rounded"
                :src="avatarUrl"
                height="200"
                width="300"
                cover
              >
                <v-fade-transition v-if= "itIsMe">
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
        <v-card-text v-model="subscriptions" >
          <p><strong>Name:</strong> {{ firstname }}</p>
          <p><strong>Surname:</strong> {{ surname }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
         
          <v-row class="mt-2 align-center">
  <v-col cols="auto">
    <v-btn color="blue" @click="navigateTo(Pages.SubscriptionsPage, { params:{ id: userRecipient } })">
      <v-icon left>mdi-account-multiple</v-icon>
      Подписки: {{  subscriptionsCount }}
    </v-btn>
  </v-col>

  <v-col cols="auto">
    <v-btn color="green" @click="navigateTo(Pages.FollowersPage, { params:{ id: userRecipient } })">
      <v-icon left>mdi-account-heart</v-icon>
      Подписчики: {{ followersCount }}
    </v-btn>
  </v-col>

  <v-col cols="auto">
    <v-btn v-if="!itIsMe" color="blue" @click="vOnSubscribe">
      <v-icon v-if="followers.includes(userId!)">mdi-account-check</v-icon>
      <v-icon v-else>mdi-account-plus</v-icon>
      {{ followers.includes(userId!) ? "Отписаться" : "Подписаться" }}
    </v-btn>
  </v-col>
</v-row>

<v-btn
            v-if="!itIsMe"
            class="edit-btn"
            color="primary"
            icon
            @click ="vOnGoToDialogue"
            style="position: absolute; top: 16px; right: 16px"
          >
            <v-icon>mdi-message</v-icon>
          </v-btn>
        
        </v-card-text>
      </v-card>

      <v-dialog v-if= "itIsMe" v-model="dialog" max-width="400">
        <v-card >
          <v-card-title>Редактировать профиль</v-card-title>
          <v-card-text>
            <v-text-field v-model="newFirstname" label="Имя"></v-text-field>
            <v-text-field v-model="newSurname" label="Фамилия"></v-text-field>
            <v-file-input
              accept="image/*"
              label="Выберите изображение"
              @change="vOnFileChange"
            ></v-file-input>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" @click="dialog = false">Отмена</v-btn>
            <v-btn color="primary" @click="vOnhandleOk">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-card v-if= "itIsMe" class="pa-4 mt-4 w-75">
        <v-card-title>Создать пост</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="newPostContent"
            label="Введите текст"
          ></v-textarea>
          <v-file-input
            accept="image/*"
            label="Добавить изображение"
            @change="vOnhandleFileChange"
          ></v-file-input>
          <v-btn color="primary" @click="vOnaddPost">Опубликовать</v-btn>
        </v-card-text>
      </v-card>

      <v-list class="mt-4 w-75">
        <v-list-item v-for="(post, index) in posts" :key="index">
          <v-card class="my-4 pa-3">
            <v-card-title
              >{{ post.user_id.firstname }}
              {{ post.user_id.surname }}</v-card-title
            >
            <v-card-text>{{ post.content }}</v-card-text>
            <v-img
              v-if="post.image_url"
              :src="`${LOCALHOST}${post.image_url}`"
              height="200"
            ></v-img>
            <LikeButton 
  :isLiked="post.likes.includes(userId!)" 
  :likesCount="post.likes.length" 
  @toggleLike="vOnlikePost(post)" 
/>
            <v-btn v-if= "itIsMe" class="ml-3" color="red" @click="vOndeletePost(post._id)">Удалить</v-btn>
          </v-card>
        </v-list-item>
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
