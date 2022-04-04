<template>
  <div id="offlineMap" style="height: 100%;min-height: 800px"></div>
</template>
<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { defineComponent } from "vue";

import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

export default defineComponent({
  name: "OfflineDownload",
  components: {},
  props: {},
  data() {
    return {};
  },
  mounted() {
    const map = L.map("offlineMap").setView([51.505, -0.09], 13);

    const layer = L.tileLayer("http://localhost:39871/tiles/{x}/{y}/{z}?{randint}", {
      randint: () => Math.floor(Math.random() * 200000) + 1,
      maxZoom: 20
    });

    layer.addTo(map);

    const cachedLayer = L.tileLayer("http://localhost:39871/cache/{x}/{y}/{z}?{randint}", {
      randint: () => Math.floor(Math.random() * 200000) + 1,
      maxZoom: 20
    });

    cachedLayer.setOpacity(0.3);
    cachedLayer.addTo(map);

    map.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawCircleMarker: false,
      drawMarker: false
    });
  }
});

</script>