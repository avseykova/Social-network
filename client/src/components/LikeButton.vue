<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  isLiked: boolean;
  likesCount: number;
}>();

const emit = defineEmits(["toggleLike"]);
</script>

<template>
  <v-btn color="blue" @click="emit('toggleLike')">
    <v-icon v-if="isLiked">mdi-thumb-up</v-icon>
    <v-icon v-else>mdi-thumb-up-outline</v-icon>
    ({{ likesCount }})
  </v-btn>
</template>
