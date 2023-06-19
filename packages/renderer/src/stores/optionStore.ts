import { defineStore } from "pinia";
import Store from "electron-store";
import got from "got";
import log from "electron-log";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

const defaultConfig = {
  autoStartGame: false,
  autoStartMod: false,
  gameStore: "MS Store",
  selectedServer: "mt.google.com",
  mapboxAccessToken: null,
  enableHighLOD: false,
  proxyAddress: null,
  cacheLocation: "D:\\cache",
  cacheEnabled: false,
  cacheSizeGB: 10,
  firstTime: true,
  userId: uuidv4()
};

const store = new Store();

export const useOptionStore = defineStore({
  id: "options",
  state: () => {
    // @ts-ignore
    let options = { ...defaultConfig, ...store.get("config", defaultConfig) as object };
    log.transports.remote.client = {
      "uuid": options.userId,
      "version": window.require("@electron/remote").app.getVersion()
    };
    return options;
  },
  actions: {
    reset() {
      log.info("Clearing local state");
      store.clear();
    },
    async updateServerConfig() {
      const body = JSON.parse(JSON.stringify(this.$state));
      log.info("Update server config: " + JSON.stringify(this.$state));
      await got.post("http://localhost:39871/configs", {
        json: body
      });
    },
    toJson() {
      return JSON.parse(JSON.stringify(this.$state));
    }
  }
});