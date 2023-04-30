<template>
  <div class="card full bg-base-100 shadow-xl ">
    <div class="card-body">
      <h2 class="card-title">Start options</h2>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Auto start mod and game</span>
          <input type="checkbox" class="checkbox" v-model="optionStore.autoStartGame">
        </label>
      </div>
      <p>Game Store</p>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">MS Store</span>
          <input type="radio" name="radio-6" value="MS Store" class="radio checked:bg-red-500" v-model="optionStore.gameStore">
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Steam</span>
          <input type="radio" name="radio-6" value="Steam" class="radio checked:bg-blue-500" v-model="optionStore.gameStore">
        </label>
      </div>

    </div>
  </div>
</template>

<script>

import { useOptionStore } from "../../stores/optionStore";

export default {
  name: "GameOptions",
  setup() {
    let optionStore = useOptionStore();
    return { optionStore };
  }
}
</script>

<style scoped>

</style>