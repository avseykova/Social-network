<script setup lang="ts">
import { ref, onMounted } from "vue";

const message = ref("");

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:5001/api");
    const data = await res.json();
    message.value = data.message;
  } catch (error) {
    console.error("Ошибка при запросе к API:", error);
  }
})

</script>

<template>
  <div>
    <h1>Vue + Node.js</h1>
    <p>{{ message }}</p>
  </div>
</template>