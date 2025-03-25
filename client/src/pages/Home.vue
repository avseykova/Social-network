<script setup lang="ts">
import type { IFeedResponse } from "../models/feedResponse.ts";
import { API_BASE_URL, LIMIT } from "../utils/constants.ts";
import axios from "axios";
import { onMounted, onUnmounted, ref } from "vue";
import type { IPost } from "../models/userPost.ts";
import PostCard from "../components/PostCard.vue";
import { useAuthStore } from "../stores/auth";

const currentPage = ref<number>(1);
const isLoading = ref<boolean>(false);
const hasMore = ref<boolean>(true);
const posts = ref<IPost[]>([]);
const auth = useAuthStore();

const fetchPosts = async (): Promise<void> => {
  if (!auth.userId || isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  try {
    const response = await axios.post<IFeedResponse>(`${API_BASE_URL}/feed`, {
      userId: auth.userId,
      page: currentPage.value,
      LIMIT,
    });

    posts.value = [...posts.value, ...response.data.posts];
    hasMore.value = response.data.hasMore;
    currentPage.value += 1;
  } catch (error) {
    console.error('Posts loading error:', error);
  } finally {
    isLoading.value = false;
  }
};

const vOnLikePost = async (post: IPost): Promise<void> => {
  try {
    const response = await axios.put<IPost>(`${API_BASE_URL}/posts/like`, {
      user_id: auth.userId,
      postId: post._id,
    });
    const updatedPost = response.data;
    const index = posts.value.findIndex((p) => p._id === post._id);
    if (index !== -1) {
      posts.value[index] = updatedPost;
    }
  } catch (error) {
    console.error('Post like error:', error);
  }
};

const handleScroll = (): void => {
  const bottomReached =
    window.innerHeight + window.scrollY >=
    document.documentElement.offsetHeight - 10;
  if (bottomReached) {
    fetchPosts();
  }
};

onMounted(() => {
  fetchPosts();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <v-container class="fill-height d-flex">

    <v-container
      class="flex-grow-1 d-flex flex-column align-center justify-center ml-6"
    >
      <v-list class="mt-4 w-75">
        <PostCard
          v-for="(post, index) in posts"
          :key="index"
          :post="post"
          @likePost="vOnLikePost"
        />
      </v-list>

      <v-progress-circular
        v-if="isLoading"
        indeterminate
        color="blue"
      ></v-progress-circular>
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
