import { createApp } from "vue";
import App from "./App.vue";
import { createVuetify } from "vuetify";
import "vuetify/lib/styles/main.css";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import router from "./router";
import { setRouter } from "./router/routerService";
import { createPinia } from "pinia";

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);
app.use(createPinia());
app.use(vuetify);
app.use(router);
setRouter(router);
app.mount("#app");
