<template>
  <n-card bordered title="Runtime Info" size="small">
    <n-space vertical size="small">
      <n-tag type="warning" size="large">It is running now and enjoy. Please do help me for future development by <a
        href="https://www.paypal.com/paypalme/siconghe?country.x=C2&locale.x=en_US">donating</a>
      </n-tag>
      <n-p>Image loaded: {{ statics.numOfImageLoaded }}</n-p>
      <n-p>Last loaded time: {{ lastLoadTimeFormatted }}</n-p>
      <n-p>Last loaded url: {{ statics.lastLoadingImageUrl }}</n-p>
      <n-p>Recent loaded image</n-p>
      <img v-bind:src=loadedImageUrl style="height: 128px; width: 128px" />
    </n-space>
  </n-card>
</template>

<script>
import { defineComponent } from "vue";
import got from "got";
import moment from "moment";


let getStaticInfoInterval = null;
let imageRndInterval = null;

export default defineComponent({
  name: "RuntimeInfo",
  data() {
    return {
      imageRnd: 0,
      statics: {
        numOfImageLoaded: 0,
        lastLoadingImageUrl: 0,
        lastLoadTime: 0
      }
    };
  },
  async mounted() {
    getStaticInfoInterval = setInterval(await this.getStaticInfo, 1000, 1000);
    imageRndInterval = setInterval(() => {
      this.imageRnd = moment().unix();
    }, 100, 100);
  },
  async unmounted() {
    clearInterval(getStaticInfoInterval);
    clearInterval(imageRndInterval);
  },
  computed: {
    loadedImageUrl() {
      return "http://localhost:39871/last-image?rnd=" + this.imageRnd;
    },
    lastLoadTimeFormatted() {
      return moment(this.statics.lastLoadTime).calendar();
    }
  },
  methods: {
    async getStaticInfo() {
      this.statics = await got.get("http://localhost:39871/statics", {
        timeout: {
          request: 2 * 1000
        }
      }).json();
    }
  }
});
</script>