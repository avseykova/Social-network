<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import LikeButton from "./LikeButton.vue";
import {LOCALHOST} from "../utils/constants.ts";

const props = defineProps<{
  post: any;
  isOwner?: boolean;
}>();

const emit = defineEmits(["likePost", "deletePost"]);
</script>

<template>
  <v-card class="my-4 pa-3">
    <v-card-title>
      {{ post.user_id.firstname }} {{ post.user_id.surname }}
    </v-card-title>
    <v-avatar v-if="post.user_id.avatar_url" size="40" class="mr-3">
            <v-img :src="`${post.user_id.avatar_url}`"  alt="Аватар"></v-img>
          </v-avatar>
    <v-card-text>{{ post.content }}</v-card-text>

    <v-img v-if="post.image_url" :src="`${LOCALHOST}${post.image_url}`" height="200"></v-img>

    <LikeButton
      :isLiked="post.likes.includes(post.user_id._id)"
      :likesCount="post.likes.length"
      @toggleLike="emit('likePost', post)"
    />

    <v-btn v-if="isOwner" class="ml-3" color="red" @click="emit('deletePost', post._id)">
      Удалить
    </v-btn>
  </v-card>
</template>
