<template>
  <div class="card full bg-base-100 shadow-xl">
    <div class="card-body text-base">
      <h2 class="card-title">Map options</h2>

      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">High LOD</span>
          <input type="checkbox" class="checkbox" v-model="optionStore.enableHighLOD">
        </label>
      </div>
      <p>When enabled, the image server will load 4 images from the next LOD level. For example, when MSFS2020 asks to
        provide images from level 18, the image server will loads 4 images from level 19 and merge them. The image
        MSFS2020
        received is a 512*512 image compared to 256*256 image.</p>
      <p>Cache option is recommended to enable to increase loading speed.</p>
      <p>Although this can provide higher resolution and improve image quality, but the loading speed may slow because
        4x images needs to be loaded.</p>
      <p>More memory maybe used because the image is 4 times larger.</p>
      <div class="divider"></div>
      <h2>Mapbox</h2>
      <p>Mapbox provide better and newer images in some places, please sign up a free key in <a class="link"
                                                                                                href="https://account.mapbox.com/access-tokens"
                                                                                                target="_blank">https://account.mapbox.com/access-tokens</a>
        and input it
        below"></p>
      <p>Note: mapbox access token provides 200,000 tiles for free, please consider use the "Rolling Cache" in side game
        or enable the "Cache" inside this mod.</p>
      <div class="form-control">
        <label class="input-group">
          <span>Token</span>
          <input type="text" placeholder="" class="input input-bordered w-full" v-model="optionStore.mapboxAccessToken">
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
};
</script>

<style scoped>

</style>
