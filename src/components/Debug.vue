<template>
  <n-h4>FAQ</n-h4>
  <n-p>Please read <a href="https://github.com/derekhe/msfs2020-google-map/wiki/FAQ" target="_blank">FAQ</a>
    page first
  </n-p>
  <n-button @click="resetToDefault">Reset to default</n-button>
  <n-h4>Logs</n-h4>
  <n-p>Please click "View" -> "Toggle Developer Tools" to view detailed log. More logs can be found in
    <b>{{ logDirectory }}</b></n-p>
</template>

<script>
import { defineComponent } from "vue";
import log from "electron-log";

const getDirectory = (path) => {
  return path.substring(0, path.lastIndexOf("\\") + 1);
};

export default defineComponent({
  name: "Debug",
  data() {
    return {
      logDirectory: getDirectory(log.transports.file.getFile().path)
    };
  }
});

</script>