<template>
  <n-radio-group
    v-model:value="selectedServer"
    name="radiogroup"
    @change="updateConfig"
  >
    <n-space>
      <n-radio
        v-for="server in servers"
        :key="server"
        :value="server"
      >
        {{ server }}
      </n-radio>
    </n-space>
  </n-radio-group>
</template>

<script>

import { defineComponent } from "vue";
import log from "electron-log";
import Store from "electron-store";
import got from "got";

const store = new Store();

export default defineComponent({
  name: "ServerSelection",
  props: {
    serverStarted: Boolean
  },
  data() {
    return {
      servers: ["mt.google.com", "khm.google.com", "ArcGIS"],
      selectedServer: store.get("selectedServer", "mt.google.com")
    };
  },
  methods: {
    async updateConfig() {
      log.info("Updating config", this.selectedServer);
      store.set("selectedServer", this.selectedServer);

      if (this.serverStarted) {
        log.info("Update server")
        await got.post("http://localhost:39871/configs", {
          json: {
            selectedServer: this.selectedServer
          }
        });
      }

      log.info("Updated config");
    }
  }
});

</script>