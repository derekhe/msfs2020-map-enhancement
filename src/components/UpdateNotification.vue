<template>
  <n-alert title="Update available" type="warning" closable v-if="updateAvailable">
    <n-space vertical size="small">
      <n-collapse>
        <n-collapse-item v-bind:title="'New Version:' + updateInfo.releaseName" name="1">
          <n-p v-html="updateInfo.releaseNotes"></n-p>
          <a href="https://flightsim.to/file/19345/msfs-2020-google-map-replacement" target="_blank">Download
            and
            install from FlightSim.to</a>
        </n-collapse-item>
      </n-collapse>
    </n-space>
  </n-alert>
</template>

<script>
import { defineComponent } from "vue";
import { EVENT_CHECK_UPDATE } from "../consts/custom-events";
import log from "electron-log";

export default defineComponent({
  name:"UpdateNotification",
  async mounted() {
    setTimeout(await this.checkAppUpdate, 2000);
  },
  data() {
    return {
      updateAvailable: false,
      updateInfo: {}
    };
  },
  methods: {
    async checkAppUpdate() {
      const updateCheckResult = await window.ipcRenderer.invoke(EVENT_CHECK_UPDATE);
      console.log(updateCheckResult);
      const appVersion = window.require("electron").remote.app.getVersion();
      this.updateAvailable = appVersion !== updateCheckResult.version;
      if (!this.updateAvailable) {
        log.info("No update version");
        return;
      }
      this.updateInfo = updateCheckResult;
    }
  }
});

</script>
