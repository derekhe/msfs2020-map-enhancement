<template>
  <n-p>Server can be changed on the fly when you are flying. Choose the one you like best.</n-p>
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
  <n-h3>Google servers</n-h3>
  <n-p>They provide the best resolution when flying low and seems very update to date. Both Google server's images are the same, choose the fastest from mt and khm server.</n-p>
  <n-p>In some places, google servers are blocked, you should setup a proxy.</n-p>
  <n-h3>ArcGIS</n-h3>
  <n-p>ArcGIS server provides more natural color than Google server in some areas, but it lacks high resolution data when flying low. Some areas have different satellite images in different resolution, so you will see image changes when flying low.</n-p>
  <n-P>ArcGIS server does not need to use a proxy.</n-P>
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