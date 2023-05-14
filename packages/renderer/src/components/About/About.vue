<template>
  <div class="hero h-full bg-base-200">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">MSFS2020 Map Enhancement</h1>
        <p class="py-6">By He Sicong</p>
        <div class="divider"></div>
        <div class="space-x-4">
          <button class="btn btn-primary btn-sm"><a
            href="https://zh.flightsim.to/file/19345/msfs-2020-google-map-replacement" target="_blank">HomePage</a>
          </button>
          <button class="btn btn-primary btn-sm"><a href="https://github.com/derekhe/msfs2020-map-enhancement"
                                                    target="_blank">Github
            Repository</a></button>
          <button class="btn btn-primary btn-sm"><a href="https://github.com/derekhe/msfs2020-map-enhancement/releases"
                                                    target="_blank">Old
            Releases</a></button>
        </div>
        <div class="divider"></div>
        <div class="indicator" v-if="this.statusStore.updateInfo">
          <div class="indicator-item indicator-bottom">
            <button class="btn btn-primary"><a href="https://flightsim.to/file/19345/msfs-2020-google-map-replacement"
                                               target="_blank">Update</a></button>
          </div>
          <div class="card border">
            <div class="card-body">
              <h2 class="card-title">New version: {{ releaseVersion }}</h2>
              <div v-html="releaseNotes"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStatusStore } from "../../stores/statusStore";

export default {
  name: "About",
  data() {
    let statusStore = useStatusStore();
    return {
      statusStore
    };
  },
  computed: {
    releaseVersion() {
      return this.statusStore.updateInfo ? this.statusStore.updateInfo.releaseName : "";
    },
    releaseNotes() {
      return this.statusStore.updateInfo ? this.statusStore.updateInfo.releaseNotes : "";
    }
  }
};
</script>

<style scoped>

</style>