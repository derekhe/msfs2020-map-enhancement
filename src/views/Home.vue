<template>
  <n-message-provider>
    <n-layout content-style="padding: 24px;" style="height: 100%">
      <n-layout-content>
        <n-card v-bind:title="'MSFS2020 Map Replacement v' + appVersion" style="margin-bottom: 16px">
          <UpdateNotification />
          <n-tabs type="line">
            <n-tab-pane name="Mod Control" tab="Mod Control">
              <n-space vertical size="large">
                <FirstTime />
                <Important v-if="!serverStarted" />
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
                <RuntimeInfo v-if="healthCheckPassed" />
              </n-space>
            </n-tab-pane>
            <n-tab-pane name="Proxy Settings" tab="Proxy Settings">
              <ProxySettings />
            </n-tab-pane>
            <n-tab-pane name="Map Server" tab="Map Server">
              <ServerSelection/>
            </n-tab-pane>
            <n-tab-pane name="Debug" tab="Trouble Shooting">
              <Debug/>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-layout-content>
      <Footer />
    </n-layout>
  </n-message-provider>
</template>

<script>
import { defineComponent } from "vue";
import { EVENT_CHECK_PORT, EVENT_START_SERVER, EVENT_STOP_SERVER } from "@/consts/custom-events";
import got from "got";
import Store from "electron-store";
import { CheckmarkCircle, CloseCircle } from "@vicons/ionicons5";

import log from "electron-log";

const store = new Store();
import { useMessage } from "naive-ui";
import { HEALTH_CHECK } from "@/consts/constants";
import Footer from "@/components/Footer";
import FirstTime from "@/components/FirstTime";
import UpdateNotification from "@/components/UpdateNotification";
import Important from "@/components/Important";
import ProxySettings from "@/components/ProxySettings";
import RuntimeInfo from "@/components/RuntimeInfo";
import Debug from "@/components/Debug";
import ServerSelection from "@/components/ServerSelection";

const messageOptions = { keepAliveOnHover: true, closable: true };

export default defineComponent({
  name: "Home",
  components: {
    ServerSelection,
    Debug,
    RuntimeInfo,
    ProxySettings,
    Important,
    FirstTime,
    CheckmarkCircle,
    CloseCircle,
    Footer,
    UpdateNotification
  },
  data() {
    return {
      serverStarting: false,
      serverStarted: false,
      imageAccessHealthCheckResult: null,
      nginxServerHealthCheckResult: null,
      HEALTH_CHECK: HEALTH_CHECK,
      appVersion: window.require("electron").remote.app.getVersion()
    };
  },
  setup() {
    window.$message = useMessage();
  },
  computed: {
    healthCheckPassed() {
      return this.nginxServerHealthCheckResult === HEALTH_CHECK.Passed && this.imageAccessHealthCheckResult === HEALTH_CHECK.Passed;
    }
  },
  async mounted() {
    setTimeout(await this.check443Port, 500);
    setInterval(() => {
      this.imageRnd = new Date();
    }, 100, 100);
  },
  methods: {
    async handleServerToggle(value) {
      this.serverStarting = true;
      const proxyAddress = store.get("proxyAddress", "");
      const selectedServer = store.get("selectedServer", "mt.google.com");

      if (value) {
        log.info("Starting mod");
        this.imageAccessHealthCheckResult = HEALTH_CHECK.Checking;
        this.nginxServerHealthCheckResult = HEALTH_CHECK.Checking;

        const result = await window.ipcRenderer
          .invoke(EVENT_START_SERVER, {
            proxyAddress, selectedServer
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
    }
  }
});
</script>

<style scoped>
</style>
