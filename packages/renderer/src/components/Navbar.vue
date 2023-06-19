<template>
  <div class="navbar bg-base-100 titlebar">
    <a class="btn btn-ghost normal-case text-xl">MSFS2020 Map Enhancement ({{appVersion}})</a>
  </div>
</template>

<script>
import { useStatusStore } from "../stores/statusStore";

export default {
  name: "Navbar",
  data() {
    let statusStore = useStatusStore();
    return {
      appVersion: statusStore.appVersion
    };
  }
};
</script>

<style scoped>

</style>