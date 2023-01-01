<template>
  <n-message-provider>
    <n-layout content-style="padding: 24px;">
      <n-layout-content>
        <n-card title="MSFS2020 Map Enhancement" style="margin-bottom: 16px">
          <n-tabs type="line">
            <n-tab-pane name="oasis" tab="Mod Control">
              <n-space vertical size="large">
                <n-switch
                  @update:value="handleServerToggle"
                  :loading="serverStarting"
                  v-model:value="serverStarted"
                >
                  <template #checked>Back to Bing Map</template>
                  <template #unchecked>Inject Google Map</template>
                </n-switch>
                <n-alert title="Health Check" type="success" v-if="healthCheckResult === 'passed'">Passed</n-alert>
                <n-alert title="Health Check" type="info" v-if="healthCheckResult === 'checking'">Checking</n-alert>
                <n-alert title="Health Check" type="error" v-if="healthCheckResult === 'failed'">Failed</n-alert>
              </n-space>
            </n-tab-pane>
            <n-tab-pane name="the beatles" tab="Proxy Settings">
              <n-p>
                If you need proxy to access google, please fill the proxy
                address. Format http://ipaddress:port
              </n-p>
              <n-space>
                <n-input
                  v-model:value="proxyAddress"
                  type="text"
                  placeholder="http://ipaddress:port"
                  @change="updateStore"
                />
                <n-button @click="testProxy" v-model:loading="proxyTesting">
                  Test Proxy
                </n-button>
              </n-space>
            </n-tab-pane>
            <n-tab-pane name="jay chou" tab="Map Server">
              <n-radio-group
                v-model:value="selectedServer"
                name="radiogroup"
                @change="updateStore"
              >
                <n-space>
                  <n-radio
                    v-for="server in googleServers"
                    :key="server"
                    :value="server"
                  >
                    {{ server }}
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-layout-content>
      <n-layout-footer></n-layout-footer>
    </n-layout>
  </n-message-provider>
</template>

<script>
import { defineComponent } from "vue";
import { EVENT_START_SERVER, EVENT_STOP_SERVER } from "@/consts/custom-events";
import got from "got";
import Store from "electron-store";
import { HttpsProxyAgent } from "hpagent";

const store = new Store();
import { useMessage } from "naive-ui";

export default defineComponent({
  name: "Home",
  data() {
    return {
      googleServers: ["mt.google.com", "khm.google.com"],
      selectedServer: store.get("selectedServer", "mt.google.com"),
      proxyAddress: store.get("proxyAddress", null),
      proxyTesting: false,
      serverStarting: false,
      serverStarted: false,
      healthCheckResult: null
    };
  },
  setup() {
    window.$message = useMessage();
  },
  methods: {
    async handleServerToggle(value) {
      this.healthCheckResult = "checking";
      this.serverStarting = true;

      if (value) {
        window.ipcRenderer
          .invoke(EVENT_START_SERVER, {
            proxyAddress: this.proxyAddress,
            selectedServer: this.selectedServer
          })
          .then(async (result) => {
            this.serverStarting = false;
            if (result.success) {
              this.serverStarted = true;
              setTimeout(await this.healthCheck, 10 * 1000);
            } else {
              window.$message.error(
                "Start server failed, error: " + result.error
              );
              this.serverStarted = false;
            }
          });
      } else {
        window.ipcRenderer.invoke(EVENT_STOP_SERVER).then((result) => {
          this.serverStarting = false;
          if (!result.success) {
            window.$message.error("Stop server failed, error: " + result.error);
          }
        });
      }
    },
    updateStore() {
      store.set("proxyAddress", this.proxyAddress);
      store.set("selectedServer", this.selectedServer);
    },
    async testProxy() {
      const url = `https://khm.google.com/kh/v=908?x=1&y=1&z=1`;

      let options = {
        timeout: {
          request: 15 * 1000
        },
        agent: {
          https: new HttpsProxyAgent({
            keepAlive: false,
            maxSockets: 128,
            maxFreeSockets: 128,
            scheduling: "fifo",
            proxy: this.proxyAddress
          })
        }
      };
      try {
        this.proxyTesting = true;
        const resp = await got(url, options);

        if (resp.statusCode === 200) {
          window.$message.info("Proxy test passed");
        } else {
          window.$message.error("Proxy test failed");
        }
      } catch (ex) {
        window.$message.error("Proxy test failed");
      } finally {
        this.proxyTesting = false;
      }
    },
    async healthCheck() {
      console.log("Health Checking");
      const url = `https://kh.ssl.ak.tiles.virtualearth.net/health`;

      let options = {
        timeout: {
          request: 15 * 1000
        },
        rejectUnauthorized: false
      };
      try {
        const resp = await got(url, options);

        console.log(resp.statusCode, resp.body);

        if (resp.statusCode === 200 && resp.body === "alive") {
          this.healthCheckResult = "passed";
        } else {
          this.healthCheckResult = "failed";
        }
      } catch (ex) {
        console.error(ex);
        this.healthCheckResult = "failed";
      }
    }
  }
});
</script>

<style scoped>
.n-gradient-text {
  font-size: 36px;
}
</style>
