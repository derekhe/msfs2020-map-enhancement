import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import naive from "naive-ui";
import log from "electron-log"

process.on("unhandledRejection", (error) => {
  log.error("unhandledRejection", error);
});

log.info("Application starting")
createApp(App).use(store).use(router).use(naive).mount("#app");
