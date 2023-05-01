import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import mitt from "mitt";

const app = createApp(App)
app.config.globalProperties.$eventBus = mitt()
app
  .use(createPinia())
  .mount("#app")
  .$nextTick(window.removeLoading);
