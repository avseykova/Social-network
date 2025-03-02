<script setup lang="ts">
import { ref, onMounted } from "vue";
import { strings } from "../resources/strings.ts";
import {
  DEFAULT_AVATAR,
  USER_KEY,
  LOCALHOST,
  FIRSTNAME_KEY,
  API_BASE_URL,
} from "../utils/constants.ts";
import { navigateTo as vOnnavigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import axios from "axios";
import type { IPost } from "@/models/userPost.ts";

const email = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);
const vOndialog = ref<boolean>(false);
const avatarUrl = ref<string>(DEFAULT_AVATAR);
const newAvatarUrl = ref<string>('');
const selectedFile = ref<File | null>(null);
const isUploading = ref<boolean>(false);
const firstname = ref<string>('');
const newFirstname = ref<string>('');
const surname = ref<string>('');
const newSurname = ref<string>('');
const posts = ref<IPost[]>([]);
const newPostContent = ref('');
const newPostImage = ref<File | null>(null);
const userId = ref<string | null>(localStorage.getItem(USER_KEY));

const vOnhandleOk = async () => {
  await uploadAvatar();
  await updateUserBD();
  await fetchUser();
  vOndialog.value = false;
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

const vOnaddPost = async () => {
  if (!newPostContent.value && !newPostImage.value) return;

  let imageUrl = '';
  if (newPostImage.value) {
    const formData = new FormData();
    formData.append('image', newPostImage.value);
    try {
      const uploadResponse = await axios.post<{ url: string }>(
        `${LOCALHOST}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      imageUrl = uploadResponse.data.url;
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
    }
  }

  try {
    const response = await axios.post<IPost>(`${API_BASE_URL}/posts`, {
      user_id: userId.value,
      content: newPostContent.value,
      image_url: imageUrl,
    });

    posts.value.unshift(response.data);
    console.log(response.data);
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

const vOnhandleLogout = () => {
  localStorage.removeItem(USER_KEY);
  vOnnavigateTo(Pages.Login);
};

const fetchUser = async (): Promise<void> => {
  message.value = '';
  isError.value = false;

  try {
    const user_id: string | null = localStorage.getItem(USER_KEY);

    if (!user_id) {
      vOnnavigateTo(Pages.Login);
      return;
    }
    const response = await axios.post(
      `${API_BASE_URL}/user-info`,
      { user_id },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.data) {
      firstname.value = response.data.firstname;
      surname.value = response.data.surname;
      email.value = response.data.email;
      avatarUrl.value = response.data.avatarUrl || DEFAULT_AVATAR;
      localStorage.setItem(FIRSTNAME_KEY, firstname.value);
    }

    message.value = strings.userPageLoaded;
  } catch (error) {
    message.value =
      error instanceof Error ? error.message : strings.networkError;
    isError.value = true;
  }
};

const updateUserBD = async () => {
  try {
    console.log(newFirstname.value, newSurname.value);

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
  isUploading.value = true;

  const formData = new FormData();
  formData.append('image', selectedFile.value);

  try {
    const response = await axios.post(
      `${LOCALHOST}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    newAvatarUrl.value = `${LOCALHOST}${response.data.url}`;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  } finally {
    isUploading.value = false;
  }
};

onMounted(() => {
  fetchUser();
  fetchPosts(userId.value);
});

</script>

<template>
  <v-container class="fill-height d-flex">
    <v-navigation-drawer app permanent class="custom-nav" width="200">
      <v-list dense>
        <v-list-item link @click="vOnnavigateTo(Pages.Chats)">
          <v-list-item-content class="d-flex align-center">
            <v-icon>mdi-chat</v-icon>
            <v-list-item-title class="ml-2">Чаты</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="vOnnavigateTo(Pages.AllUsersPage)">
          <v-list-item-content class="d-flex align-center">
            <v-icon>mdi-account-group</v-icon>
            <v-list-item-title class="ml-2">Пользователи</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

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
                <v-fade-transition>
                  <v-btn
                    class="edit-btn"
                    v-if="isHovering"
                    color="primary"
                    icon
                    @click="vOndialog = true"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </v-fade-transition>
              </v-img>
            </div>
          </v-hover>
        </v-card-text>
        <v-card-text>
          <p><strong>Name:</strong> {{ firstname }}</p>
          <p><strong>Surname:</strong> {{ surname }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
          <v-btn class="mt-4" block color="primary" @click="vOnhandleLogout">
            Logout
          </v-btn>
        </v-card-text>
      </v-card>

      <v-dialog v-model="vOndialog" max-width="400">
        <v-card>
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
            <v-btn color="red" @click="vOndialog = false">Отмена</v-btn>
            <v-btn color="primary" @click="vOnhandleOk">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-card class="pa-4 mt-4 w-75">
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
        <v-list-item v-for="post in posts" :key="post._id">
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
            <v-btn color="red" @click="vOndeletePost(post._id)">Удалить</v-btn>
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
