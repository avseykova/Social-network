<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { io, Socket } from "socket.io-client";
import { LOCALHOST, USER_KEY, API_BASE_URL } from "../utils/constants";
import { useRoute } from "vue-router";
import axios from "axios";
import type { IChatMessageToView } from "../models/chatMessageToView";
import type { IChatMessage } from "../models/chatMessage";
import ChatMessage from "../components/ChatMessage.vue";
import NavigationDrawer from "../components/NavigationDrawer.vue";

const socket: Socket = io(LOCALHOST);
const messagesToView = ref<IChatMessageToView[]>([]);
const chat_id = ref<string>('');
const newMessage = ref<string>('');
const editingMessage = ref<IChatMessageToView | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);
const userId = ref<string | null>(localStorage.getItem(USER_KEY));

const autoScroll = async (): Promise<void> => {
  await nextTick();
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }, 100);
};

const messageRoom = (): void => {
  if (chat_id.value) {
    socket.emit('messageRoom', chat_id.value);
  }
};

const loadMessages = async (): Promise<void> => {
  try {
    const sender_id = localStorage.getItem(USER_KEY);
    const route = useRoute();
    const receiver_id = route.params.id;
    const response = await axios.get<{ messages: IChatMessageToView[]; chatId: string }>(`${API_BASE_URL}/messages`, {
      params: { sender_id: sender_id, receiver_id: receiver_id },
    });
    messagesToView.value = response.data.messages;
    chat_id.value = response.data.chatId;
    await autoScroll();
  } catch (error) {
    console.error('Ошибка загрузки сообщений:', error);
  }
};

const vOnSendMessage = async (): Promise<void> => {
  if (!newMessage.value.trim()) return;

  const message: IChatMessage = {
    user_id: localStorage.getItem(USER_KEY)!,
    chat_id: chat_id.value,
    content: newMessage.value,
  };

  socket.emit('chatMessage', message);

  newMessage.value = '';
  await autoScroll();
};

const vOnEditMessage = async (): Promise<void> => {
  if (!newMessage.value.trim() || !editingMessage.value) return;

  try {
    editingMessage.value.content = newMessage.value;
    socket.emit('messageUpdated', editingMessage.value);
    newMessage.value = '';
    editingMessage.value = null;
  } catch (error) {
    console.error('Ошибка при редактировании сообщения:', error);
  }
};

const vOnSetEditingMessage = (message: IChatMessageToView) => {
  editingMessage.value = message;
  newMessage.value = message.content;
};

const vOnDeleteMessage = async (messageId: string) => {
  socket.emit('messageDelete', messageId);
};

const vOnSendOrEditMessage = async (): Promise<void> => {
  if (editingMessage.value) {
    await vOnEditMessage();
  } else {
    await vOnSendMessage();
  }
};

onMounted(async () => {
  await loadMessages();
  messageRoom();

  socket.on('chatMessage', async (message: IChatMessageToView) => {
    messagesToView.value.push(message);
    await autoScroll();
  });

  socket.on('messageUpdated', (message: IChatMessageToView) => {
    const index = messagesToView.value.findIndex(msg => msg._id === message._id);
    
    if (index !== -1) {
      messagesToView.value[index] = message;
    }
  });

  socket.on('messageDeleted', (messageId: string) => {
    messagesToView.value = messagesToView.value.filter(msg => msg._id !== messageId);

  });
});
</script>
<template>
  <v-container>
    <NavigationDrawer :userId="userId" />
    <v-card class="pa-4" max-width="600" style="margin: auto">
      <v-card-title>Чат</v-card-title>

      <div ref="messagesContainer" style="height: 300px; overflow-y: auto">
        <v-list>
          <ChatMessage
            v-for="(msg, index) in messagesToView"
            :key="index"
            :message="msg"
            @editMessage="vOnSetEditingMessage"
            @deleteMessage="vOnDeleteMessage"
          />
        </v-list>
      </div>

      <v-divider></v-divider>

      <v-card-actions>
        <v-text-field
          v-model="newMessage"
          label="Введите сообщение..."
          @keyup.enter="vOnSendMessage"
          outlined
          dense
          style="flex: 1"
        ></v-text-field>
        <v-btn color="primary" @click="vOnSendOrEditMessage">
          {{ editingMessage ? "Обновить" : "Отправить" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
