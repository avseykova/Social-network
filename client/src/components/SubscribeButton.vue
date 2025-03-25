<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

defineProps<{
  isSubscribed: boolean;
}>();

const emit = defineEmits(['toggleSubscribe']);
</script>

<template>
  <v-btn color="blue" @click="emit('toggleSubscribe')">
    <v-icon v-if="isSubscribed">mdi-account-check</v-icon>
    <v-icon v-else>mdi-account-plus</v-icon>
    {{ isSubscribed ? "Subscribe" : "Unsubscribe" }}
  </v-btn>
</template>
