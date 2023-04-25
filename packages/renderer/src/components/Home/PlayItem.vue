<template>
  <div v-bind:id="currentId" class="carousel-item relative w-full">
    <div class="card w-full bg-base-100 shadow-xl">
      <figure class="px-10 pt-10">
        <img :src=image alt="Shoes"
             class="rounded-xl" />
      </figure>
      <div class="card-body items-center text-center">
        <h2 class="card-title">{{ title }}</h2>
        <p>{{ description }}
        </p>
        <div class="card-actions">
          <button class="btn btn-primary" @click="startServer">Fly with {{ title }}</button>
        </div>
      </div>
    </div>

    <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
      <a :href="'#' + prevId" class="btn btn-circle">❮</a>
      <a :href="'#' + nextId" class="btn btn-circle">❯</a>
    </div>
  </div>
</template>

<script>

import log, { info } from "electron-log";
import { EVENT_START_SERVER } from "../../../../consts/custom-events";
import { globalOptions } from "../../globalOptions";
import { toRefs } from "vue";

export default {
  name: "PlayItem",
  props: ["title", "description", "currentId", "nextId", "prevId", "image"],
  data() {
    return {
      globalOptions
    };
  },
  methods: {
    async startServer() {
      log.info("Starting mod");
      const result = await window.ipcRenderer
        .invoke(EVENT_START_SERVER, JSON.parse(JSON.stringify(globalOptions)));
      info("Start mod result", result);
    }
  }
};
</script>

<style scoped>

</style>