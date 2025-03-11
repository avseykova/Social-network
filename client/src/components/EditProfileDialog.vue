<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from "vue";

const props = defineProps<{
  dialog: boolean;
  user: { firstname: string; surname: string; avatarUrl: string };
}>();

const emit = defineEmits(["update:dialog", "close", "save"]);

const dialogModel = computed({
  get: () => props.dialog,
  set: (value) => emit("update:dialog", value),
});

const newFirstname = ref(props.user.firstname);
const newSurname = ref(props.user.surname);
const newAvatar = ref<File | null>(null);
const previewAvatar = ref(props.user.avatarUrl); 

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    newAvatar.value = target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      previewAvatar.value = e.target?.result as string;
    };
    reader.readAsDataURL(newAvatar.value);
  }
};

const saveChanges = () => {
  emit("save", {
    firstname: newFirstname.value,
    surname: newSurname.value,
    avatar: newAvatar.value, 
  });
  emit("update:dialog", false); 
};
</script>

<template>
  <v-dialog v-model="dialogModel" max-width="400">
    <v-card>
      <v-card-title>Редактировать профиль</v-card-title>
      <v-card-text>
        <v-text-field v-model="newFirstname" label="Имя"></v-text-field>
        <v-text-field v-model="newSurname" label="Фамилия"></v-text-field>

        <div class="text-center mt-4">
          <v-avatar size="80">
            <v-img :src="previewAvatar" alt="Аватар"></v-img>
          </v-avatar>
        </div>

        <v-file-input
          accept="image/*"
          label="Выберите изображение"
          @change="handleFileChange"
          dense
        ></v-file-input>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="emit('update:dialog', false)">Отмена</v-btn>
        <v-btn color="primary" @click="saveChanges">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
