<script setup lang="ts">
import { useAuthStore } from "./stores/auth";
import NavigationDrawer from "../src/components/NavigationDrawer.vue";

const auth = useAuthStore();

</script>

<template>
  <v-app >
    <NavigationDrawer v-if="auth.isAuthenticated"/>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

