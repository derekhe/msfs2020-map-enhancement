<template>
  <div class="card full bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Cache options</h2>
      <p>
        The internal cache is used to speed up satellite image loading speed when in game "Rolling Cache" is disabled.
        "Rolling Cache" may cause issue when you sometimes fly with Bing map and sometimes with others.</p>
      <p>
        "Rolling Cache" can be turned on while the mod's cache is on if you stick to one server provider.</p>
      <p>
        To change any options, you need to restart the injection to take effect.
      </p>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Cache Enabled</span>
            <input type="checkbox" v-model="optionStore.cacheEnabled" class="checkbox">
          </label>
        </div>

        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Cache storage path</span>
          </label>
          <input type="text" placeholder="Cache path" class="input input-bordered w-full"
                 v-model="optionStore.cacheLocation">
        </div>

        <h3>Cache size {{ optionStore.cacheSizeGB }}GB</h3>
        <input type="range" min="10" max="100" class="range" v-model="optionStore.cacheSizeGB">
        <button class="btn" @click="clear">Clear cache</button>
        <p>{{ clearStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script>

import { useOptionStore } from "../../stores/optionStore";
import got from "got";

export default {
  name: "CacheOptions",
  data() {
    return {
      clearStatus: ""
    };
  },
  setup() {
    let optionStore = useOptionStore();
    return {
      optionStore
    };
  },
  methods: {
    async clear() {
      this.clearStatus = "Clearing, please wait";
      try {
        await got.delete("http://localhost:39871/cache");
        this.clearStatus = "Cache cleared";
      } catch (e) {
        this.clearStatus = "Clear cache error, please retry or restart mod";
      }
    }
  }
};
</script>

<style scoped>

</style>