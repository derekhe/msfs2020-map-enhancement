<template>
  <div class="card full bg-base-100 shadow-xl ">
    <div class="card-body">
      <h2 class="card-title">Reset to Default</h2>
      <button class="btn w-24" @click="resetToDefault">Reset</button>
    </div>
  </div>
</template>

<script>

import { useOptionStore } from "../../stores/optionStore";

export default {
  name: "ResetToDefault",
  setup() {
    const optionStore = useOptionStore();
    return { optionStore };
  },
  methods: {
    resetToDefault() {
      this.optionStore.reset();
      this.optionStore.$reset();
    }
  }
};
</script>

<style scoped>

</style>