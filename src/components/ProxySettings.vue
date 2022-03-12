<template>
  <n-space vertical>
    <n-p>
      If you need proxy to access google, please fill the proxy
      address. Format http://ipaddress:port
    </n-p>
    <n-p>
      Leave blank if you don't need proxy to access google
    </n-p>
    <n-space>
      <n-input
        v-model:value="proxyAddress"
        type="text"
        placeholder="http://ipaddress:port"
        @change="updateConfig"
      />
      <n-button @click="checkProxy" v-model:loading="proxyChecking">
        Test Proxy
      </n-button>
      <n-button @click="clearProxy">
        Clear Proxy
      </n-button>
    </n-space>
    <n-alert title="Proxy" type="info" v-if="proxyTestResult === HEALTH_CHECK.Passed">
      Proxy check passed
    </n-alert>
    <n-alert title="Proxy" type="error" v-if="proxyTestResult === HEALTH_CHECK.Failed">
      Can't access google, please check your proxy setting
    </n-alert>
  </n-space>
</template>

<script>
import { defineComponent } from "vue";
import { HEALTH_CHECK } from "@/consts/constants";
import log from "electron-log";
import got from "got";
import { HttpsProxyAgent } from "hpagent";
import Store from "electron-store";

const store = new Store();

export default defineComponent({
  name: "ProxySettings",
  props: {
    serverStarted: Boolean
  },
  data() {
    return {
      HEALTH_CHECK: HEALTH_CHECK,
      proxyAddress: store.get("proxyAddress", ""),
      proxyTestResult: null
    };
  },
  computed: {
    proxyChecking() {
      return this.proxyTestResult === HEALTH_CHECK.Checking;
    }
  },
  methods: {
    async checkProxy() {
      log.info("Checking proxy", this.proxyAddress);
      const url = `https://khm.google.com/kh/v=908?x=1&y=1&z=1`;

      let options = {
        timeout: {
          request: 5 * 1000
        },
        agent: this.proxyAddress ? {
          https: new HttpsProxyAgent({
            keepAlive: false,
            maxSockets: 128,
            maxFreeSockets: 128,
            scheduling: "fifo",
            proxy: this.proxyAddress
          })
        } : undefined
      };

      try {
        this.proxyTestResult = HEALTH_CHECK.Checking;
        const resp = await got(url, options);

        log.info("Check proxy result", resp.statusCode);
        if (resp.statusCode === 200) {
          this.proxyTestResult = HEALTH_CHECK.Passed;
        } else {
          this.proxyTestResult = HEALTH_CHECK.Failed;
        }
      } catch (ex) {
        log.info("Check proxy failed", ex);
        this.proxyTestResult = HEALTH_CHECK.Failed;
      }
    },
    async updateConfig() {
      store.set("proxyAddress", this.proxyAddress);

      if (this.serverStarted) {
        await got.post("http://localhost:39871/configs", {
          json: {
            proxyAddress: this.proxyAddress
          }
        });

        window.$message.info("Proxy config updated");
      }

      log.info("Updated config");
    },
    async clearProxy() {
      this.proxyAddress = "";
      await this.updateConfig();
    }
  },
});


</script>