<template>
  <n-layout-footer
    bordered
    position="absolute" style="padding: 10px"
  >
    <n-space>
      <n-p>Author: He Sicong</n-p>
      <a href="https://flightsim.to/file/19345/msfs-2020-google-map-replacement" target="_blank">Home Page</a>
      <a href="https://github.com/derekhe/msfs2020-google-map-electron/issues" target="_blank">Report Issue</a>
      <a href="https://www.paypal.com/paypalme/siconghe?country.x=C2&locale.x=en_US" target="_blank">Donate</a>
    </n-space>
  </n-layout-footer>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Footer",
});
</script>

<style scoped>

</style>