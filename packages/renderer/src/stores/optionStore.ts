import { defineStore } from "pinia";
import Store from "electron-store";

const defaultConfig = {
  autoStartGame: false,
  gameStore: "MS Store",
  selectedServer: "Bing (Latest)",
  mapboxAccessToken: null,
  enableHighLOD: false,
  proxyAddress: null,
  cacheLocation: "D:\\cache",
  cacheEnabled: false,
  cacheSizeGB: 10
};

const store = new Store();

export const useOptionStore = defineStore("options", {
  state: () => {
    // @ts-ignore
    return store.get("config", defaultConfig) as object;
  },
  actions: {
    reset() {
      store.clear();
    }
  }
});