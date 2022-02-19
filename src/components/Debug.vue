<template>
  <n-h4>FAQ</n-h4>
  <n-p>Please read <a href="https://github.com/derekhe/msfs2020-map-enhancement/wiki/FAQ" target="_blank">FAQ</a>
    page first
  </n-p>
  <n-button @click="resetToDefault">Reset to default</n-button>
  <n-h4>Logs</n-h4>
  <n-p>Please click "View" -> "Toggle Developer Tools" to view detailed log. More logs can be found in
    <n-li>{{ logDirectory }}</n-li>
    <n-li>{{ appDirectory }}extra\nginx\logs</n-li>
    <n-li>{{ appDirectory }}extra\server\logs</n-li>
  </n-p>
  <a href="https://github.com/derekhe/msfs2020-map-enhancement/issues/new?assignees=&labels=&template=bug_report.md&title=" target="_blank">Report issue</a>
</template>

<script>
import { defineComponent } from "vue";
import log from "electron-log";
import { EVENT_STOP_SERVER } from "@/consts/custom-events";
import Store from "electron-store";

const store = new Store();

const getDirectory = (path) => {
  return path.substring(0, path.lastIndexOf("\\") + 1);
};

export default defineComponent({
  name: "Debug",
  data() {
    return {
      logDirectory: getDirectory(log.transports.file.getFile().path),
      appDirectory: getDirectory(window.require("electron").remote.app.getAppPath())
    };
  },
  methods: {
    async resetToDefault() {
      store.clear();
      await window.ipcRenderer.invoke(EVENT_STOP_SERVER);
      window.$message.warning("Please restart to take effect");
    }
  }
});

</script>