<template>
  <div class="card full bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Map options</h2>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">High LOD</span>
          <input type="checkbox" class="checkbox" v-model="optionStore.enableHighLOD">
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { useOptionStore } from "../../stores/optionStore";

export default {
  name: "MapOptions",
  setup() {
    let optionStore = useOptionStore();
    return { optionStore };
  }
}
</script>

<style scoped>

</style>