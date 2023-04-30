<template>
  <div class="card full bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Proxy Settings</h2>
      <p>If you need proxy to access google, please fill the proxy address. Format http://ipaddress:port</p>
      <p>Leave blank if you don't need proxy to access google</p>
      <div class="flex space-x-4 pt-4">
        <input type="text" placeholder="http://ipaddress:port" class="input input-bordered w-64" v-model="optionStore.proxyAddress">
        <button class="btn" @click="checkProxy">Test</button>
        <button class="btn" @click="clear">Clear</button>
      </div>
      <div class="badge badge-success gap-2" v-if="proxyCheckPassed === HEALTH_CHECK.Passed">
        success
      </div>
      <div class="badge badge-error gap-2" v-if="proxyCheckPassed === HEALTH_CHECK.Failed">
        error
      </div>
    </div>
  </div>
</template>

<script>
import { useOptionStore } from "../../stores/optionStore";
import { HttpsProxyAgent } from "hpagent";
import log from "electron-log";
import got from "got";
import { STATUS } from "../../../../consts/constants";

export default {
  name: "ProxySettings",
  setup() {
    let optionStore = useOptionStore();
    return { optionStore };
  },
  data() {
    return {
      proxyCheckPassed: STATUS.NotStarted,
      HEALTH_CHECK: STATUS
    };
  },
  methods: {
    clear() {
      this.optionStore.proxyAddress = null;
    },
    async checkProxy() {
      log.info("Checking proxy", this.optionStore.proxyAddress);
      const url = `https://khm.google.com/kh/v=908?x=1&y=1&z=1`;

      let options = {
        timeout: {
          request: 5 * 1000
        },
        agent: this.optionStore.proxyAddress ? {
          https: new HttpsProxyAgent({
            keepAlive: false,
            maxSockets: 128,
            maxFreeSockets: 128,
            scheduling: "fifo",
            proxy: this.optionStore.proxyAddress
          })
        } : undefined
      };

      try {
        const resp = await got(url, options);
        log.info("Check proxy result", resp.statusCode);
        this.proxyCheckPassed = STATUS.Passed;
      } catch (ex) {
        this.proxyCheckPassed = STATUS.Failed;
        log.info("Check proxy failed", ex);
      }
    },
    async updateConfig() {
      await got.post("http://localhost:39871/configs", {
        json: {
          proxyAddress: this.optionStore.proxyAddress
        }
      });

      log.info("Updated config");
    }
  }
};
</script>

<style scoped>

</style>