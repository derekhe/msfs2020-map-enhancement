<template>
  <n-layout content-style="padding: 24px;">
    <n-layout-header bordered>
      <n-gradient-text type="info">MSFS2020 Map Enhancement</n-gradient-text>
    </n-layout-header>
    <n-layout-content content-style="padding: 24px;">
      <n-space vertical justify="start" align="start">
        <n-collapse :default-expanded-names="['1', '2', '3']">
          <n-collapse-item title="Mod Control" name="1">
            <n-space>
              <n-switch @update:value="handleUpdateValue">
                <template #checked>Back to Bing Map</template>
                <template #unchecked>Inject Google Map</template>
              </n-switch>
            </n-space>
          </n-collapse-item>
          <n-collapse-item title="Proxy Settings" name="2">
            <n-space>
              <n-input type="text" placeholder="IP address" />
              <n-button>Test Access</n-button>
            </n-space>
          </n-collapse-item>
          <n-collapse-item title="Google Server" name="3">
            <n-radio-group v-model:value="selectedServer" name="radiogroup">
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
</template>

<script>
import { defineComponent } from "vue";
import { EVENT_START_SERVER, EVENT_STOP_SERVER } from "@/consts/custom-events";

export default defineComponent({
  name: "Home",
  data() {
    return {
      googleServers: ["mt.google.com", "kms.google.com"],
      selectedServer: "mt.google.com",
    };
  },
  setup() {
    return {
      handleUpdateValue(value) {
        if (value) {
          window.ipcRenderer.send(EVENT_START_SERVER);
        } else {
          window.ipcRenderer.send(EVENT_STOP_SERVER);
        }
      },
    };
  },
});
</script>

<style scoped>
.n-gradient-text {
  font-size: 36px;
}
</style>
