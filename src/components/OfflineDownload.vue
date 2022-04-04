<template>
  <div id="offlineMap" style="height: 100%;min-height: 800px"></div>
  <n-button @click="startDownload">Cache selected region</n-button>
</template>
<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { defineComponent } from "vue";
import got from "got";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

export default defineComponent({
  name: "OfflineDownload",
  components: {},
  props: {},
  data() {
    return {
      map: undefined
    };
  },
  mounted() {
    this.map = L.map("offlineMap").setView([30.659462, 104.065735], 5);

    const layer = L.tileLayer("http://localhost:39871/tiles/{x}/{y}/{z}?{randint}", {
      randint: () => Math.floor(Math.random() * 200000) + 1,
      maxZoom: 20
    });

    layer.addTo(this.map);

    const cachedLayer = L.tileLayer("http://localhost:39871/cache/{x}/{y}/{z}?{randint}", {
      randint: () => Math.floor(Math.random() * 200000) + 1,
      maxZoom: 20
    });

    cachedLayer.setOpacity(0.3);
    cachedLayer.addTo(this.map);

    this.map.pm.addControls({
      position: "topleft",
      drawCircle: false,
      drawCircleMarker: false,
      drawMarker: false
    });
  },
  methods: {
    async startDownload() {
      const fg = L.featureGroup();
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Path || layer instanceof L.Marker) {
          fg.addLayer(layer);
        }
      });

      console.log(fg.toGeoJSON());

      await got.post("http://localhost:39871/offlinedownload", {
        json: fg.toGeoJSON()
      });
    }
  }
});

</script>