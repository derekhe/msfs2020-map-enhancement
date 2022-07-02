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
  userId: uuidv4(),
  license: "RypWRVJTSU9OOnB5YXJtb3ItdmF4LTAwMjgxMy4yCipUSU1FOjE2NjQ1NTM2MDAKKkZMQUdTOgIqQ09ERTpyZWdjb2RlLTAxDORivMfzhYZ0Hx0QxNDnlRu4vw9S7PnuCSZlHm4sZii2FT28kqUAWJ51BLyMzX9jHb+z/dFsReEx7DV2oQ88WqqmKNgYtsLen/fzL0QW7qQAUdgXpBlolU8Q+PUyEyNcciBzwTv6AnS1OCFJcthE8rct+1r0i0olVvB6bd9h8sJ1p4yNnb1EWrh3DYwcPzY4gHOiXVKyIl0mVAVr3N127f0Lzxxop4G93nxDgvqvPmUpV3iW25irY7lDBjWzBUQwH5I9Tmd5rXm0Ulxrn/bTIqsmH+wffR2D3ZBWh2x6LA7upnDU0ysy/S567zHfRgJXTefxTdYoqLKLAXyd/GOQpA==",
  remoteLogEnabled: true
};

const store = new Store();

export const useOptionStore = defineStore({
  id: "options",
  state: () => {
    // @ts-ignore
    let options = { ...defaultConfig, ...store.get("config", defaultConfig) as object };
    options['license'] = "RypWRVJTSU9OOnB5YXJtb3ItdmF4LTAwMjgxMy4yCipUSU1FOjE2NjQ1NTM2MDAKKkZMQUdTOgIqQ09ERTpyZWdjb2RlLTAxDORivMfzhYZ0Hx0QxNDnlRu4vw9S7PnuCSZlHm4sZii2FT28kqUAWJ51BLyMzX9jHb+z/dFsReEx7DV2oQ88WqqmKNgYtsLen/fzL0QW7qQAUdgXpBlolU8Q+PUyEyNcciBzwTv6AnS1OCFJcthE8rct+1r0i0olVvB6bd9h8sJ1p4yNnb1EWrh3DYwcPzY4gHOiXVKyIl0mVAVr3N127f0Lzxxop4G93nxDgvqvPmUpV3iW25irY7lDBjWzBUQwH5I9Tmd5rXm0Ulxrn/bTIqsmH+wffR2D3ZBWh2x6LA7upnDU0ysy/S567zHfRgJXTefxTdYoqLKLAXyd/GOQpA=="
    log.transports.remote.client = {
      "uuid": options.userId,
      "version": window.require("@electron/remote").app.getVersion()
    };

    if(!options.remoteLogEnabled){
      log.transports.remote.level = false;
    }

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