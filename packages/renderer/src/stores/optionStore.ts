import { defineStore } from "pinia";
import Store from "electron-store";
import got from "got";
import log from "electron-log";

const defaultConfig = {
  autoStartGame: false,
  gameStore: "MS Store",
  selectedServer: "mt.google.com",
  mapboxAccessToken: null,
  enableHighLOD: false,
  proxyAddress: null,
  cacheLocation: "D:\\cache",
  cacheEnabled: false,
  cacheSizeGB: 10,
  firstTime: true
};

const store = new Store();

export const useOptionStore = defineStore({
  id: "options",
  state: () => {
    // @ts-ignore
    return store.get("config", defaultConfig) as object;
  },
  actions: {
    reset() {
      log.info("Clearing local state")
      store.clear();
    },
    async updateServerConfig() {
      log.info("Update server config");
      const body = JSON.parse(JSON.stringify(this.$state));
      await got.post("http://localhost:39871/configs", {
        json: body
      });
    }
  }
});