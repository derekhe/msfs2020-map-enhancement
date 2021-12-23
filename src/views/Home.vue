<template>
  <n-message-provider>
    <n-layout content-style="padding: 24px;">
      <n-layout-header bordered>
        <n-gradient-text type="info">MSFS2020 Map Enhancement</n-gradient-text>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <n-space vertical justify="start" align="start">
          <n-collapse :default-expanded-names="['1', '2', '3']">
            <n-collapse-item title="Mod Control" name="1">
              <n-space>
                <n-switch @update:value="handleServerToggle">
                  <template #checked>Back to Bing Map</template>
                  <template #unchecked>Inject Google Map</template>
                </n-switch>
              </n-space>
            </n-collapse-item>
            <n-collapse-item title="Proxy Settings" name="2">
              <n-p>
                If you need proxy to access google, please fill the proxy address.
                Format http://ipaddress:port
              </n-p>
              <n-space>
                <n-input v-model:value="proxyAddress" type="text" placeholder="http://ipaddress:port"
                         @change="updateStore" />
                <n-button @click="testProxy" v-model:loading="proxyTesting">Test Proxy</n-button>
              </n-space>
            </n-collapse-item>
            <n-collapse-item title="Google Server" name="3">
              <n-radio-group v-model:value="selectedServer" name="radiogroup" @change="updateStore">
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
            </n-collapse-item>
          </n-collapse>
        </n-space>
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
      proxyTesting: false
    };
  },
  setup() {
    window.$message = useMessage();
  },
  methods: {
    handleServerToggle(value) {
      if (value) {
        window.ipcRenderer.send(EVENT_START_SERVER, {
          proxyAddress: this.proxyAddress,
          selectedServer: this.selectedServer
        });
      } else {
        window.ipcRenderer.send(EVENT_STOP_SERVER);
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
    }
  }
});
</script>

<style scoped>
.n-gradient-text {
  font-size: 36px;
}
</style>
