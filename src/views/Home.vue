<template>
  <n-message-provider>
    <n-layout content-style="padding: 24px;" style="height: 100%">
      <n-layout-content>
        <n-card title="MSFS2020 Map Enhancement" style="margin-bottom: 16px">
          <n-tabs type="line">
            <n-tab-pane name="Mod Control" tab="Mod Control">
              <n-space vertical size="large">
                <n-alert title="First time usage" type="warning" closable>
                  A self-signed certificate will be generated and added into trust store when you enable this mod for
                  the
                  first time.
                  Please accept the pop-up window otherwise this mod will not work.
                </n-alert>
                <n-alert title="Important" type="warning">
                  <n-ul>
                    <n-li>Run this mod before MSFS2020, otherwise default bing map may appear randomly</n-li>
                    <n-li>Setup proxy if your access to google is blocked</n-li>
                    <n-li>Disable any firewall and antivirus if you have trouble</n-li>
                  </n-ul>
                </n-alert>
                <n-switch
                  @update:value="handleServerToggle"
                  :loading="serverStarting"
                  v-model:value="serverStarted"
                  size="large"
                >
                  <template #checked>Back to Bing Map</template>
                  <template #unchecked>Inject Google Map</template>
                </n-switch>
                <n-alert title="Health Check" type="success"
                         v-if="mockServerHealthCheckResult === HEALTH_CHECK.Passed && nginxServerHealthCheckResult ===HEALTH_CHECK.Passed">
                  Passed
                </n-alert>
                <n-alert title="Health Check" type="info"
                         v-if="mockServerHealthCheckResult === HEALTH_CHECK.Checking || nginxServerHealthCheckResult ===HEALTH_CHECK.Checking">
                  Checking
                </n-alert>
                <n-alert title="Health Check" type="error"
                         v-if="mockServerHealthCheckResult === HEALTH_CHECK.Failed">
                  Mock Server Check Failed
                </n-alert>
                <n-alert title="Health Check" type="error"
                         v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Failed">
                  Nginx Server Check Failed
                </n-alert>
                <n-alert title="Proxy" type="error" v-if="proxyTestResult === HEALTH_CHECK.Failed">
                  Can't access google, please check your proxy setting
                </n-alert>
              </n-space>
            </n-tab-pane>
            <n-tab-pane name="Proxy Settings" tab="Proxy Settings">
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
                </n-space>
                <n-alert title="Proxy" type="info" v-if="proxyTestResult === HEALTH_CHECK.Passed">
                  Proxy check passed
                </n-alert>
                <n-alert title="Proxy" type="error" v-if="proxyTestResult === HEALTH_CHECK.Failed">
                  Can't access google, please check your proxy setting
                </n-alert>
              </n-space>
            </n-tab-pane>
            <n-tab-pane name="Map Server" tab="Map Server">
              <n-radio-group
                v-model:value="selectedServer"
                name="radiogroup"
                @change="updateConfig"
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
      <n-layout-footer
        bordered
        position="absolute" style="padding: 10px"
      >
        <n-space>
          <n-p>Author: He Sicong</n-p>
          <a href="https://github.com/derekhe/msfs2020-google-map-electron">Home Page</a>
          <a href="https://zh.flightsim.to/file/19345/msfs-2020-google-map-replacement">Discussion</a>
          <a href="https://github.com/derekhe/msfs2020-google-map/issues">Report Issue</a>
          <a href="https://www.paypal.com/paypalme/siconghe?country.x=C2&locale.x=en_US" target="_blank">Donate</a>
        </n-space>
      </n-layout-footer>
    </n-layout>
  </n-message-provider>
</template>

<script>
import { defineComponent } from "vue";
import { EVENT_START_SERVER, EVENT_STOP_SERVER } from "@/consts/custom-events";
import got from "got";
import Store from "electron-store";
import { HttpsProxyAgent } from "hpagent";

import log from "electron-log";

const store = new Store();
import { useMessage } from "naive-ui";
import { HEALTH_CHECK } from "@/consts/constants";

const messageOptions = {keepAliveOnHover: true, closable: true}

export default defineComponent({
  name: "Home",
  data() {
    return {
      googleServers: ["mt.google.com", "khm.google.com"],
      selectedServer: store.get("selectedServer", "mt.google.com"),
      proxyAddress: store.get("proxyAddress", ""),
      serverStarting: false,
      serverStarted: false,
      mockServerHealthCheckResult: null,
      nginxServerHealthCheckResult: null,
      proxyTestResult: null,
      HEALTH_CHECK: HEALTH_CHECK
    };
  },
  setup() {
    window.$message = useMessage();
  },
  computed: {
    proxyChecking: {
      get() {
        return this.proxyTestResult === HEALTH_CHECK.Checking;
      }
    }
  },
  methods: {
    async handleServerToggle(value) {
      this.serverStarting = true;

      if (value) {
        log.info("Starting mod");
        this.mockServerHealthCheckResult = HEALTH_CHECK.Checking;
        this.nginxServerHealthCheckResult = HEALTH_CHECK.Checking;

        window.ipcRenderer
          .invoke(EVENT_START_SERVER, {
            proxyAddress: this.proxyAddress,
            selectedServer: this.selectedServer
          })
          .then(async (result) => {
            log.info("Start mod result", result);
            this.serverStarting = false;
            if (result.success) {
              this.serverStarted = true;
              setTimeout(await this.checkMockServer, 10 * 1000);
              setTimeout(await this.checkNginxServer, 10 * 1000);
              if (this.proxyAddress) {
                this.proxyTestResult = HEALTH_CHECK.Checking;
                setTimeout(await this.checkProxy, 10 * 1000);
              }
            } else {
              window.$message.error(
                "Start server failed, error: " + result.error, messageOptions
              );
              log.info("Start mod failed", result.error);
              this.serverStarted = false;
            }
          });
      } else {
        log.info("Stopping mod");
        this.mockServerHealthCheckResult = HEALTH_CHECK.NotStarted;
        this.nginxServerHealthCheckResult = HEALTH_CHECK.NotStarted;
        this.proxyTestResult = HEALTH_CHECK.NotStarted;
        window.ipcRenderer.invoke(EVENT_STOP_SERVER).then((result) => {
          this.serverStarting = false;
          if (!result.success) {
            window.$message.error("Stop server failed, error: " + result.error, messageOptions);
            log.info("Stop mod failed, error", result.error);
          }
        });
      }
    },
    async updateConfig() {
      log.info("Updating config", this.proxyAddress, this.selectedServer);
      store.set("proxyAddress", this.proxyAddress);
      store.set("selectedServer", this.selectedServer);

      if (this.serverStarted) {
        await got.post("http://localhost:39871/configs", {
          json: {
            proxy: this.proxyAddress,
            selectedServer: this.selectedServer
          }
        });
      }

      log.info("Updated config");
    },
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
    async checkMockServer() {
      const url = `https://kh.ssl.ak.tiles.virtualearth.net/health`;

      let options = {
        timeout: {
          request: 15 * 1000
        },
        rejectUnauthorized: false
      };
      try {
        log.info("Checking mock server");
        const resp = await got(url, options);

        log.info("Mock server response", resp.statusCode, resp.body);

        if (resp.statusCode === 200 && resp.body === "alive") {
          this.mockServerHealthCheckResult = HEALTH_CHECK.Passed;
        } else {
          this.mockServerHealthCheckResult = HEALTH_CHECK.Failed;
        }
      } catch (ex) {
        log.error(ex);
        this.mockServerHealthCheckResult = HEALTH_CHECK.Failed;
      }
    },
    async checkNginxServer() {
      const url = "https://khstorelive.azureedge.net/results/v1.20.0/coverage_maps/lod_8/12202100.cov?version=3";

      let options = {
        timeout: {
          request: 15 * 1000
        },
        rejectUnauthorized: false
      };

      try {
        log.info("Checking nginx server");
        await got(url, options);
      } catch (ex) {

        if (ex instanceof got.HTTPError) {
          log.info("Nginx server check result", ex.response.statusCode);
          if (ex.response.statusCode === 404) {
            log.info("Nginx server check passed");
            this.nginxServerHealthCheckResult = HEALTH_CHECK.Passed;
          } else {
            this.nginxServerHealthCheckResult = HEALTH_CHECK.Failed;
          }
        } else {
          this.nginxServerHealthCheckResult = HEALTH_CHECK.Failed;
        }
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
