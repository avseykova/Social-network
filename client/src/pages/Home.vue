<script setup lang="ts">
import type { IFeedResponse } from '../models/feedResponse.ts';
import { API_BASE_URL, USER_KEY } from '../utils/constants';
import axios from 'axios';
import { onMounted,onUnmounted, ref } from 'vue';
import { Pages } from "../utils/pages.ts";
import { navigateTo as navigateTo } from "../router/routerService.ts";
import {LOCALHOST} from "../utils/constants.ts";
import type { IPost } from '../models/userPost.ts';
import NavigationDrawer from "../components/NavigationDrawer.vue";
import LikeButton from "../components/LikeButton.vue";

const userId = ref <string | null>(localStorage.getItem(USER_KEY));
const currentPage = ref(1);
const limit = 5; 
const isLoading = ref(false);
const hasMore = ref(true); 


const posts = ref<IPost[]>([]);
  const fetchPosts = async () => {
  if (!userId.value || isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  try {
    const response = await axios.post<IFeedResponse>(`${API_BASE_URL}/feed`, {
      userId: userId.value,
      page: currentPage.value,
      limit
    });

    posts.value = [...posts.value, ...response.data.posts];
    hasMore.value = response.data.hasMore; 
    currentPage.value += 1;
  } catch (error) {
    console.error('Ошибка загрузки постов:', error);
  } finally {
    isLoading.value = false;
  }
};


const vOnHandleLogout = () => {
  localStorage.removeItem(USER_KEY);
  navigateTo(Pages.Login);
};


const vOnlikePost = async (post: IPost) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/posts/like`, {
      user_id: userId.value, 
      postId: post._id,
    });
    const updatedPost = response.data; 
    const index = posts.value.findIndex(p => p._id === post._id);
    if (index !== -1) {
      posts.value[index] = updatedPost;
    }
  } catch (error) {
    console.error("Ошибка при лайке поста:", error);
  }
};

const handleScroll = () => {
  const bottomReached = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 10;
  if (bottomReached) {
    fetchPosts();
    
  }
};


onMounted(() => {
  fetchPosts();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
 

</script>

<template>
    <v-container class="fill-height d-flex">
      <NavigationDrawer :userId="userId" />
  
      <v-container
        class="flex-grow-1 d-flex flex-column align-center justify-center ml-6"
      >
  
        <v-list class="mt-4 w-75">
          <v-list-item v-for="(post, index) in posts" :key="index">
            <v-card class="my-4 pa-3">
              <v-card-title class="d-flex align-center">
              <v-avatar v-if="post.user_id.avatar_url" size="40" class="mr-3">
            <v-img :src="`${post.user_id.avatar_url}`"  alt="Аватар"></v-img>
          </v-avatar>

                {{ post.user_id.firstname }}
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
            </v-card>
          </v-list-item>
        </v-list>
        
      <v-progress-circular v-if="isLoading" indeterminate color="blue"></v-progress-circular>
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
  
