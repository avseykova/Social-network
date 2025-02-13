import { createApp } from "vue";
import App from "./App.vue";
import { createVuetify } from 'vuetify'
import 'vuetify/lib/styles/main.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App);
app.config.globalProperties.$apiUrl = "http://localhost:5001/api";
app.mount("#app");

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App).use(vuetify).mount('#app')