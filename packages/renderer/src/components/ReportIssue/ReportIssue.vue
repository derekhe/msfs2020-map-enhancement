<template>
  <div class="text-base space-y-4">
    <p>Please read FAQ page first
      <button class="btn btn-sm btn-primary"><a
        href="https://github.com/derekhe/msfs2020-map-enhancement/wiki/FAQ" target="_blank">FAQ</a></button>
    </p>
    <p>If you still can't solve the problem, please click the
      <button class="btn btn-sm btn-primary" @click="collectLogs">collect logs</button>
      , and then report an new issue here:
      <button class="btn btn-sm btn-primary"><a
        href="https://github.com/derekhe/msfs2020-map-enhancement/issues/new/choose" target="_blank">New Issue</a>
      </button>
    </p>
    <p v-if="zipFilePath">Please create the issue with the zip file here: {{ zipFilePath }}</p>
  </div>
</template>

<script>
import { EVENT_COLLECT_LOGS } from "../../../../consts/custom-events";

export default {
  name: "ReportIssue",
  data() {
    return { zipFilePath: "" };
  },
  methods: {
    async collectLogs() {
      this.zipFilePath = await window.ipcRenderer
        .invoke(EVENT_COLLECT_LOGS);
    }
  }
};
</script>

<style scoped>

</style>