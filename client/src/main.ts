import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);
app.config.globalProperties.$apiUrl = "http://localhost:5001/api";
app.mount("#app");