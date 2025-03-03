<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { io, Socket } from 'socket.io-client';
import { LOCALHOST, USER_KEY, API_BASE_URL } from '../utils/constants';
import { useRoute } from 'vue-router';
import axios from 'axios';
import type { IChatMessageToView } from '../models/chatMessageToView';
import type { IChatMessage } from '../models/chatMessage';

const socket: Socket = io(LOCALHOST);
const messagesToView = ref<IChatMessageToView[]>([]);
const chat_id = ref<string>('');
const newMessage = ref<string>('');
const editingMessage = ref<IChatMessageToView | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);

const autoScroll = async () => {
  await nextTick();
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  }, 100);
};

const joinRoom = (): void => {
  if (chat_id.value) {
    socket.emit('joinRoom', chat_id.value);
  }
};

const loadMessages = async (): Promise<void> => {
  try {
    const sender_id = localStorage.getItem(USER_KEY);
    const route = useRoute();
    const receiver_id = route.params.id;
    const response = await axios.get(`${API_BASE_URL}/messages`, {
      params: { sender_id: sender_id, receiver_id: receiver_id },
    });
    messagesToView.value = response.data.messages;


    chat_id.value = response.data.chatId;
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
    await autoScroll();
  });

  socket.on('messageUpdated', (updatedMessage: IChatMessageToView) => {
    console.log(updatedMessage.username)
    const index = messagesToView.value.findIndex(msg => msg._id === updatedMessage._id);
    if (index !== -1) {
      messagesToView.value[index] = updatedMessage; 
    }
  });

  socket.on('messageDeleted', (messageId: string) => {
    console.log("messageDeleted")
    messagesToView.value = messagesToView.value.filter(msg => msg._id !== messageId);
  });
});

const vOnsendMessage = async (): Promise<void> => {
  if (!newMessage.value.trim()) return;

  if (editingMessage.value) {
    await axios.put(`${API_BASE_URL}/messages/${editingMessage.value._id}`, { content: newMessage.value });
    editingMessage.value = null;
  } else {
    const message: IChatMessage = {
      user_id: localStorage.getItem(USER_KEY)!,
      chat_id: chat_id.value,
      content: newMessage.value,
    };

    socket.emit('chatMessage', message);
  }

  newMessage.value = '';
  await autoScroll();
};





const vOneditMessage = (message: IChatMessageToView) => {
  editingMessage.value = message;
  newMessage.value = message.content;
};

const vOndeleteMessage = async (messageId: string) => {
  await axios.delete(`${API_BASE_URL}/messages/${messageId}`);
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
            <v-list-item-action class="d-flex">
              <v-btn 
                icon 
                small 
                size="x-small" 
                @click="vOneditMessage(msg)" 
                style="min-width: 24px; padding: 2px"
              >
                <v-icon size="12">mdi-pencil</v-icon>
              </v-btn>
              <v-btn 
                icon 
                small 
                size="x-small" 
                color="red" 
                @click="vOndeleteMessage(msg._id)" 
                style="min-width: 24px; padding: 2px"
              >
                <v-icon size="12">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
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
        <v-btn color="primary" @click="vOnsendMessage">
          {{ editingMessage ? 'Обновить' : 'Отправить' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
