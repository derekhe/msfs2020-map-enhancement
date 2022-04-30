<template>
  <div class="space-y-5">
    <div class="card w-full bg-base-100 shadow-xl">
      <figure class="">
        <img src="../../../public/images/msfs-2020-google-map-replacement-E4kAr.webp"
             class="w-full h-64 object-cover rounded-box" alt="" />
      </figure>
      <div class="card-body items-center text-center">
        <p>{{ description }}</p>
      </div>
    </div>

    <div class="flex justify-center">
      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text">Select map server</span>
        </label>
        <select class="select select-bordered" v-model="optionStore.selectedServer">
          <option v-for="provider in providers">{{ provider }}</option>
        </select>
      </div>
    </div>
    <div class="space-x-5 flex justify-center">
      <button class="btn btn-primary" @click="startServer">Start Flying</button>
      <button class="btn" @click="stopServer">Stop mod</button>
    </div>
  </div>
</template>

<script>

import { MapProviders } from "../../const";
import { _ } from "lodash";
import { useOptionStore } from "../../stores/optionStore";

export default {
  name: "Start",
  emits: ["startServer", "stopServer"],
  data() {
    let optionStore = useOptionStore();
    return {
      optionStore,
      MapProviders
    };
  },
  computed: {
    providers() {
      return _.keys(MapProviders);
    },
    description() {
      console.log(this.optionStore.selectedServer);
      return MapProviders[this.optionStore.selectedServer].description;
    }
  },
  methods: {
    async startServer() {
      this.$emit("startServer");
    },
    async stopServer() {
      this.$emit("stopServer");
    },
  }
};
</script>

<style scoped>

</style>