<template>

  <div class="card full bg-base-100 shadow-xl ">
    <div class="card-body">
      <h2 class="card-title">Privacy</h2>
      <p>To help me get enough data to improve this application, please let it enabled. If you have any concern, you can turn it off.</p>
      <label class="label cursor-pointer">
        <span class="label-text">Allow collecting anonymous logs to remote server?</span>
        <input type="checkbox" v-model="optionStore.remoteLogEnabled" class="checkbox">
      </label>
    </div>
  </div>

  <div class="card full bg-base-100 shadow-xl ">
    <div class="form-control">

    </div>
  </div>
</template>

<script>

import { useOptionStore } from "../../stores/optionStore";

export default {
  name: "Privacy",
  setup() {
    const optionStore = useOptionStore();
    return { optionStore };
  },
};
</script>

<style scoped>

</style>