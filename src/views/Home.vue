<template>
  <n-message-provider>
    <n-layout content-style="padding: 24px;" style="height: 100%">
      <n-layout-content>
        <n-card v-bind:title="'MSFS2020 Map Replacement v' + appVersion" style="margin-bottom: 16px">
          <n-alert title="Update available" type="warning" closable v-if="updateAvailable">
            <n-space vertical size="small">
              <n-collapse>
                <n-collapse-item v-bind:title="'New Version:' + updateInfo.releaseName" name="1">
                  <n-p v-html="updateInfo.releaseNotes"></n-p>
                  <a href="https://flightsim.to/file/19345/msfs-2020-google-map-replacement" target="_blank">Download and
                    install from FlightSim.to</a>
                </n-collapse-item>
              </n-collapse>
            </n-space>
          </n-alert>
          <n-tabs type="line">
            <n-tab-pane name="Mod Control" tab="Mod Control">
              <n-space vertical size="large">
                <n-alert title="First time usage" type="warning" closable v-if="firstTime">
                  A self-signed certificate will be generated and added into trust store when you enable this mod for
                  the
                  first time.
                  Please accept the pop-up window otherwise this mod will not work.
                </n-alert>
                <n-alert title="Important" type="warning" v-if="!serverStarted">
                  <n-ul>
                    <n-li>Run this mod before MSFS2020, otherwise default bing map may appear randomly</n-li>
                    <n-li>If you enable rolling cache in game, please clear it before enable this mode</n-li>
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
                <n-card bordered v-if="serverStarted" title="Server check" size="small">
                  <n-space vertical size="small">
                    <n-space align="start">
                      <n-icon size="20" color="#0e7a0d" v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Passed">
                        <CheckmarkCircle />
                      </n-icon>
                      <n-icon size="20" color="#f0a020" v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Failed">
                        <CloseCircle />
                      </n-icon>
                      <n-spin size="smaller" v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Checking" />
                      <n-p>Nginx Server Access Check</n-p>
                    </n-space>
                    <n-space align="start">
                      <n-icon size="20" color="#0e7a0d" v-if="imageAccessHealthCheckResult === HEALTH_CHECK.Passed">
                        <CheckmarkCircle />
                      </n-icon>
                      <n-icon size="20" color="#f0a020" v-if="imageAccessHealthCheckResult === HEALTH_CHECK.Failed">
                        <CloseCircle />
                      </n-icon>
                      <n-spin size="smaller" v-if="imageAccessHealthCheckResult === HEALTH_CHECK.Checking" />
                      <n-p>Image Server Access Check</n-p>
                    </n-space>
                  </n-space>
                </n-card>
                <n-card bordered v-if="healthCheckPassed" title="Runtime Info" size="small">
                  <n-space vertical size="small">
                    <n-p>Image loaded {{ statics.numOfImageLoaded }}</n-p>
                    <n-p>Last loaded time {{ statics.lastLoadTime }}</n-p>
                    <n-p>Last loaded url {{ statics.lastLoadingImageUrl }}</n-p>
                    <n-p>Recent loaded image</n-p>
                    <img v-bind:src=loadedImageUrl style="height: 128px; width: 128px" />
                    <n-tag type="warning">It is running now. If you like this mod, please help me improve it by <a
                      href="https://www.paypal.com/paypalme/siconghe?country.x=C2&locale.x=en_US">donating</a>
                    </n-tag>
                  </n-space>
                </n-card>
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
            <n-tab-pane name="Debug" tab="Trouble Shooting">
              <n-h4>FAQ</n-h4>
              <n-p>Please read <a href="https://github.com/derekhe/msfs2020-google-map/wiki/FAQ" target="_blank">FAQ</a>
                page first
              </n-p>
              <n-button @click="resetToDefault">Reset to default</n-button>
              <n-h4>Logs</n-h4>
              <n-p>Please click "View" -> "Toggle Developer Tools" to view detailed log. More logs can be found in
                <b>{{ logDirectory }}</b></n-p>
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
          <a href="https://github.com/derekhe/msfs2020-google-map-electron" target="_blank">Home Page</a>
          <a href="https://zh.flightsim.to/file/19345/msfs-2020-google-map-replacement" target="_blank">Discussion</a>
          <a href="https://github.com/derekhe/msfs2020-google-map/issues" target="_blank">Report Issue</a>
          <a href="https://www.paypal.com/paypalme/siconghe?country.x=C2&locale.x=en_US" target="_blank">Donate</a>
        </n-space>
      </n-layout-footer>
    </n-layout>
  </n-message-provider>
</template>

<script>
import { defineComponent } from "vue";
import { EVENT_CHECK_PORT, EVENT_CHECK_UPDATE, EVENT_START_SERVER, EVENT_STOP_SERVER } from "@/consts/custom-events";
import got from "got";
import Store from "electron-store";
import { HttpsProxyAgent } from "hpagent";
import { CheckmarkCircle, CloseCircle } from "@vicons/ionicons5";

import log from "electron-log";

const store = new Store();
import { useMessage } from "naive-ui";
import { HEALTH_CHECK } from "@/consts/constants";


const messageOptions = { keepAliveOnHover: true, closable: true };

const getDirectory = (path) => {
  return path.substring(0, path.lastIndexOf("\\") + 1);
};

export default defineComponent({
  name: "Home",
  components: {
    CheckmarkCircle,
    CloseCircle
  },
  data() {
    return {
      googleServers: ["mt.google.com", "khm.google.com"],
      selectedServer: store.get("selectedServer", "mt.google.com"),
      proxyAddress: store.get("proxyAddress", ""),
      serverStarting: false,
      serverStarted: false,
      imageAccessHealthCheckResult: null,
      nginxServerHealthCheckResult: null,
      proxyTestResult: null,
      HEALTH_CHECK: HEALTH_CHECK,
      logDirectory: getDirectory(log.transports.file.getFile().path),
      firstTime: store.get("firstTime", true),
      imageRnd: 0,
      statics: {
        numOfImageLoaded: 0,
        lastLoadingImageUrl: 0,
        lastLoadTime: 0
      },
      appVersion: window.require("electron").remote.app.getVersion(),
      updateAvailable: false,
      updateInfo: {}
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
    },
    healthCheckPassed: {
      get() {
        return this.nginxServerHealthCheckResult === HEALTH_CHECK.Passed && this.imageAccessHealthCheckResult === HEALTH_CHECK.Passed;
      }
    },
    loadedImageUrl: {
      get() {
        return "http://localhost:39871/last-image?rnd=" + this.imageRnd;
      }
    }
  },
  async mounted() {
    setTimeout(await this.check443Port, 500);
    setInterval(() => {
      this.imageRnd = new Date();
    }, 100, 100);
    setInterval(await this.getStaticInfo, 1000, 1000);
    setTimeout(await this.checkAppUpdate, 2000);
  },
  methods: {
    async handleServerToggle(value) {
      this.serverStarting = true;

      if (value) {
        log.info("Starting mod");
        this.imageAccessHealthCheckResult = HEALTH_CHECK.Checking;
        this.nginxServerHealthCheckResult = HEALTH_CHECK.Checking;

        const result = await window.ipcRenderer
          .invoke(EVENT_START_SERVER, {
            proxyAddress: this.proxyAddress,
            selectedServer: this.selectedServer
          });

        log.info("Start mod result", result);
        this.serverStarting = false;
        if (result.success) {
          this.firstTime = false;
          store.set("firstTime", this.firstTime);
          this.serverStarted = true;
          setTimeout(await this.checkImageAccess, 10 * 1000);
          setTimeout(await this.checkNginxServer, 10 * 1000);
        } else {
          window.$message.error(
            "Start server failed, error: " + result.error, messageOptions
          );
          log.info("Start mod failed", result.error);
          this.serverStarted = false;
        }
      } else {
        log.info("Stopping mod");
        this.imageAccessHealthCheckResult = HEALTH_CHECK.NotStarted;
        this.nginxServerHealthCheckResult = HEALTH_CHECK.NotStarted;
        this.proxyTestResult = HEALTH_CHECK.NotStarted;
        const result = await window.ipcRenderer.invoke(EVENT_STOP_SERVER);
        this.serverStarting = false;
        if (!result.success) {
          window.$message.error("Stop server failed, error: " + result.error, messageOptions);
          log.info("Stop mod failed, error", result.error);
        }
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
    },
    async checkImageAccess() {
      const url = `http://localhost:39871/tiles/akh12101.jpeg?n=z&g=9580`;

      let options = {
        timeout: {
          request: 15 * 1000
        },
        rejectUnauthorized: false
      };
      try {
        log.info("Checking image access");
        const resp = await got(url, options);

        log.info("image server response", resp.statusCode);

        if (resp.statusCode === 200) {
          this.imageAccessHealthCheckResult = HEALTH_CHECK.Passed;
        } else {
          this.imageAccessHealthCheckResult = HEALTH_CHECK.Failed;
        }
      } catch (ex) {
        log.error("Image server error", ex);
        this.imageAccessHealthCheckResult = HEALTH_CHECK.Failed;
      }
    },
    async resetToDefault() {
      store.clear();
      await window.ipcRenderer.invoke(EVENT_STOP_SERVER);
      window.$message.warning("Please restart to take effect");
    },
    async check443Port() {
      const result = await window.ipcRenderer.invoke(EVENT_CHECK_PORT);
      if (result) {
        window.$message.error("443 Port is using, the mod won't work. Please close any application using 443 port. Look at the FAQ page here: https://github.com/derekhe/msfs2020-google-map/wiki/FAQ#443-port-is-occupied", messageOptions);
      }
    },
    async getStaticInfo() {
      if (this.imageAccessHealthCheckResult !== HEALTH_CHECK.Passed) return;

      this.statics = await got.get("http://localhost:39871/statics", {
        timeout: {
          request: 2 * 1000
        }
      }).json();
    },
    async checkAppUpdate() {
      const updateCheckResult = await window.ipcRenderer.invoke(EVENT_CHECK_UPDATE);
      console.log(updateCheckResult);
      this.updateAvailable = this.appVersion !== updateCheckResult.version;
      if (!this.updateAvailable) {
        log.info("No update version");
        return;
      }
      this.updateInfo = updateCheckResult;
    }
  }
});
</script>

<style scoped>
</style>
