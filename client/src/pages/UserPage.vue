<script setup lang="ts">
import { ref, onMounted } from "vue";
import { API_BASE_URL } from "../config/config.ts";
import { strings } from "../resources/strings.ts";
import { USER_KEY } from "../utils/constants.ts";
import { navigateTo } from "../router/routerService.ts";
import { Pages } from "../utils/pages.ts";
import axios from "axios";

const name = ref<string>('');
const email = ref<string>('');
const message = ref<string>('');
const isError = ref<boolean>(false);
const vOndialog = ref<boolean>(false);
const avatarUrl = ref<string>(
  'http://localhost:5002/uploads/default_avatar.png'
);
const selectedFile = ref<File | null>(null);
const isUploading = ref<boolean>(false);

const vOnhandleLogout = () => {
  localStorage.removeItem(USER_KEY);
  navigateTo(Pages.Login);
};

const fetchUser = async (): Promise<void> => {
  message.value = '';
  isError.value = false;

  try {
    const username: string | null = localStorage.getItem(USER_KEY);

    if (!username) {
      navigateTo(Pages.Login);
      return;
    }
    const response = await axios.post(
      `${API_BASE_URL}/user-info`,
      { username },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.data) {
      name.value = response.data.username;
      email.value = response.data.email;
      avatarUrl.value =
        response.data.avatarUrl ||
        'http://localhost:5002/uploads/default_avatar.png';
    }

    message.value = strings.userPageLoaded;
  } catch (error) {
    message.value =
      error instanceof Error ? error.message : strings.networkError;
    isError.value = true;
  }
};

const updateUserBD = async (username: string, avatarUrl: string) => {
  try {
    const response = await axios.put('http://localhost:5002/updateuser', {
      username,
      avatarUrl,
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
    uploadAvatar();
  }
};

const uploadAvatar = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;

  const formData = new FormData();
  formData.append('avatar', selectedFile.value);

  try {
    const response = await axios.post(
      'http://localhost:5002/profile/upload-avatar',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    avatarUrl.value = `http://localhost:5002${response.data.url}`;

    await updateUserBD(name.value, avatarUrl.value);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  } finally {
    isUploading.value = false;
  }
};

onMounted(() => {
  fetchUser();
});

</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" width="300">
      <v-card-title class="text-center text-h5">User Page</v-card-title>

      <v-card-text class="d-flex flex-column align-center">
        <v-hover v-slot:default="{ isHovering, props }">
          <div class="image-container" v-bind="props">
            <v-img
              class="rounded"
              v-if="avatarUrl"
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
        <v-alert
          class="mb-4"
          v-if="message"
          :type="isError ? 'error' : 'success'"
        >
          {{ message }}
        </v-alert>

        <div>
          <p><strong>Name:</strong> {{ name }}</p>
          <p><strong>Email:</strong> {{ email }}</p>
        </div>

        <v-btn
          class="mt-4"
          type="submit"
          block
          color="primary"
          @click="vOnhandleLogout"
        >
          Logout
        </v-btn>
      </v-card-text>
    </v-card>

    <v-dialog v-model="vOndialog" max-width="400">
      <v-card>
        <v-card-title>Загрузить новое изображение</v-card-title>
        <v-card-text>
          <v-file-input
            accept="image/*"
            label="Выберите изображение"
            @change="vOnFileChange"
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="vOndialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="vOndialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
