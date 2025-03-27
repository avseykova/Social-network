<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

defineProps<{
  message: { _id: string; username: string; content: string };
}>();

const emit = defineEmits(['editMessage', 'deleteMessage']);
</script>

<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>
        <strong>{{ message.username }}:</strong> {{ message.content }}
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-btn icon small size="x-small" @click="emit('editMessage', message)">
        <v-icon size="12">mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon small size="x-small" color="red" @click="emit('deleteMessage', message._id)">
        <v-icon size="12">mdi-delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>