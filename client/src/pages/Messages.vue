<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { io, Socket } from "socket.io-client";
import { LOCALHOST, USER_KEY, API_BASE_URL } from "../utils/constants";
import { useRoute } from "vue-router";
import axios from "axios";
import type { IChatMessageToView } from "@/models/chatMessageToView";
import type { IChatMessage } from "@/models/chatMessage";


const socket: Socket = io(LOCALHOST);
const messagesToView = ref<IChatMessageToView[]>([]);
const chat_id = ref<string>('');
const newMessage = ref<string>('');
const messagesContainer = ref<HTMLDivElement | null>(null);

const autoScroll = async () => {
  await nextTick();
  setTimeout(() => {
    if (messagesContainer.value) {
      console.log('scrollHeight:', messagesContainer.value.scrollHeight);
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    } else {
      console.error('messagesContainer не найден');
    }
  }, 100);
};

const joinRoom = (): void => {
  console.log('joinRoom: chat_id =', chat_id.value);
  if (chat_id.value) {
    socket.emit('joinRoom', chat_id.value);
    console.log(`Пользователь вошёл в комнату: ${chat_id.value}`);
  } else {
    console.error('chat_id не задан');
  }
};

const loadMessages = async (): Promise<void> => {
  try {
    const sender_id = localStorage.getItem(USER_KEY);
    const route = useRoute();
    const receiver_id = route.params.id;
    const response = await axios.get(`${API_BASE_URL}/messages`, {
      params: { user1: sender_id, user2: receiver_id },
    });
    messagesToView.value = response.data.messages;
    chat_id.value = response.data.chatId;
    console.log('Загруженные сообщения:', messagesToView.value);
    console.log('chat_id:', chat_id.value);
    await autoScroll();
  } catch (error) {
    console.error('Ошибка загрузки сообщений:', error);
  }
};

onMounted(async () => {
  await loadMessages();
  joinRoom();
  socket.on('chatMessage', async (message: IChatMessageToView) => {
    messagesToView.value.push(message);
    console.log('Новое сообщение:', message);
    await autoScroll();
  });
});

const vOnsendMessage = async (): Promise<void> => {
  const message: IChatMessage = {
    user_id: localStorage.getItem(USER_KEY)!,
    chat_id: chat_id.value,
    content: newMessage.value,
  };

  socket.emit('chatMessage', message);
  newMessage.value = '';
  await autoScroll();
};

</script>

<template>
  <v-container>
    <v-card class="pa-4" max-width="600" style="margin: auto">
      <v-card-title>Чат</v-card-title>
      
      <div ref="messagesContainer" style="height: 300px; overflow-y: auto">
        <v-list>
          <v-list-item v-for="(msg, index) in messagesToView" :key="index">
            <v-list-item-content>
              <v-list-item-title>
                <strong>{{ msg.username }}:</strong> {{ msg.content }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>

      <v-divider></v-divider>

      <v-card-actions>
        <v-text-field
          v-model="newMessage"
          label="Введите сообщение..."
          @keyup.enter="vOnsendMessage"
          outlined
          dense
          style="flex: 1"
        ></v-text-field>
        <v-btn color="primary" @click="vOnsendMessage"> Отправить </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
