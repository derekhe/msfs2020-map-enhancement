<template>
  <n-alert title="First time usage" type="warning" closable v-if="firstTime">
    A self-signed certificate will be generated and added into trust store when you enable this mod for
    the
    first time.
    Please accept the pop-up window otherwise this mod will not work.
  </n-alert>
</template>

<script>
import { defineComponent } from "vue";

import Store from "electron-store";

const store = new Store();
export default defineComponent({
  name: "FirstTime",
  data() {
    return {
      firstTime: store.get("firstTime", true)
    };
  }
});
</script>

<style scoped>

</style>