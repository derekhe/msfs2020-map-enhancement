<template>
  <n-h2>Map Server</n-h2>
  <n-p>Server can be changed on the fly when you are flying. Choose the one you like best.</n-p>
  <n-radio-group
    v-model:value="selectedServer"
    name="radiogroup"
    @change="updateConfig"
    style="padding-bottom: 20px"
  >
    <n-space>
      <n-radio
        v-for="server in servers"
        :key="server"
        :value="server"
      >
        {{ server }}
      </n-radio>
    </n-space>
  </n-radio-group>
  <div v-show="selectedServer==='Mapbox'">
    <n-h3>Mapbox</n-h3>
    <n-p>Mapbox provide better and newer images in some places, please sign up a free key in
      <n-a href="https://account.mapbox.com/access-tokens/" target="_blank">https://account.mapbox.com/access-tokens
      </n-a>
      and input it below
    </n-p>
    <n-input v-model:value="mapboxAccessToken" type="text" placeholder="Mapbox Access Token" />
    <n-p>Note: mapbox access token provides 200,000 tiles for free, please consider use the "Rolling Cache" in side
      game
      or enable the "Cache" inside this mod.
    </n-p>
  </div>
  <div v-show="selectedServer==='mt.google.com' || selectedServer ==='khm.google.com'">
    <n-h3>Google servers</n-h3>
    <n-p>They provide the best resolution when flying low and seems very update to date. Both Google server's images
      are
      the same, choose the fastest from mt and khm server.
    </n-p>
    <n-p>In some places, google servers are blocked, you should setup a proxy.</n-p>
  </div>
  <div v-show="selectedServer==='ArcGIS'">
    <n-h3>ArcGIS</n-h3>
    <n-p>ArcGIS server provides more natural color than Google server in some areas, but it lacks high resolution data
      when flying low. Some areas have different satellite images in different resolution, so you will see image
      changes
      when flying low.
    </n-p>
    <n-P>ArcGIS server does not need to use a proxy.</n-P>
  </div>
  <div v-show="selectedServer==='Bing Map (Latest)'">
    <n-h3>Bing Map (Latest)</n-h3>
    <n-p>MSFS's bing map is quite old in the game, select this will replace the bing map to latest bing map (same as
      https://www.bing.com/maps/aerial)
    </n-p>
  </div>

  <n-h2>Experiment: High LOD</n-h2>
  <n-checkbox v-model:checked="enableHighLOD">Enable High LOD</n-checkbox>
  <n-p>
    When enabled, the image server will load 4 images from the next LOD level. For example, when MSFS2020 asks to
    provide images from level 18, the image server will loads 4 images from level 19 and merge them. The image MSFS2020
    received is a 512*512 image compared to 256*256 image.
  </n-p>
  <n-h3>Note</n-h3>
  <n-ul>
    <n-li>
      Cache option is recommended to enable to increase loading speed.
    </n-li>
    <n-li>
      Although this can provide higher resolution and improve image quality, but the loading speed may slow because
      4x images needs to be loaded.
    </n-li>
    <n-li>More memory maybe used because the image is 4 times larger.</n-li>
  </n-ul>
</template>

<script>

import { defineComponent } from "vue";
import log from "electron-log";
import Store from "electron-store";
import got from "got";

const store = new Store();

export default defineComponent({
  name: "ServerSelection",
  props: {
    serverStarted: Boolean
  },
  data() {
    return {
      servers: ["mt.google.com", "khm.google.com", "ArcGIS", "Bing Map (Latest)", "Mapbox"],
      selectedServer: store.get("selectedServer", "mt.google.com"),
      mapboxAccessToken: store.get("mapboxAccessToken", ""),
      enableHighLOD: store.get("enableHighLOD", false)
    };
  },
  watch: {
    mapboxAccessToken: function(val, oldVal) {
      store.set("mapboxAccessToken", val);
    },
    enableHighLOD: function(val) {
      store.set("enableHighLOD", val);
    }
  },
  methods: {
    async updateConfig() {
      log.info("Updating config", this.selectedServer);
      store.set("selectedServer", this.selectedServer);

      if (this.serverStarted) {
        log.info("Update server");
        await got.post("http://localhost:39871/configs", {
          json: {
            selectedServer: this.selectedServer,
            enableHighLOD: this.enableHighLOD
          }
        });

        //await got.post("http://localhost:39871/clear-cache");
      }

      log.info("Updated config");
    }
  }
});

</script>