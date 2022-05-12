<template>
  <div class="absolute inset-x-0 bottom-0 space-y-4">
    <div class="alert shadow-lg">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             class="stroke-info flex-shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>It is running now and enjoy. Please do help me for future development by donating.</span>
      </div>
      <div class="flex-none">
        <button class="btn btn-sm btn-primary" @click="donate">
          <a href="https://www.paypal.com/paypalme/siconghe?country.x=C2&locale.x=en_US" target="_blank">
            DONATE A CUP OF COFFEE</a></button>
      </div>
    </div>
    <div class="stats shadow bg-neutral-focus flex justify-center">
      <div class="stat">
        <div class="stat-title">Total Loaded Image</div>
        <div class="stat-value text-primary">{{ statics.numOfImageLoaded }}</div>
        <div class="stat-desc">{{ lastLoadTimeFormatted }}</div>
        <div class="stat-desc">({{statics.lastLoadingTime.toFixed(1)}}s)</div>
      </div>
      <div class="stat">
        <div class="stat-title">Loaded Image</div>
        <div class="stat-value text-secondary">
          <img :src="loadedImageUrl" class="w-16 h-16" />
        </div>
        <div class="stat-desc truncate w-32">
          <a target="_blank" :href="statics.lastLoadingImageUrl">{{ statics.lastLoadingImageUrl }}</a>
        </div>
      </div>
      <div class="stat">
        <div class="stat-title">Cache Hit</div>
        <div class="stat-value text-primary">{{ statics.cacheHit }}/{{ cacheRate }}%</div>
      </div>
      <div class="stat">
        <div class="stat-title">Data Usage</div>
        <div class="stat-value text-primary">{{ usedInMB }}MB</div>
      </div>
    </div>
  </div>
</template>

<script>
import got from "got";
import moment from "moment";

let getStaticInfoInterval = null;
let imageRndInterval = null;


export default {
  name: "RuntimeInfo",
  data() {
    return {
      imageRnd: 0,
      statics: {
        numOfImageLoaded: 0,
        lastLoadingImageUrl: 0,
        lastLoadTime: 0,
        lastLoadingTime: 0,
        cacheHit: 0,
        bytesLoaded: 0
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
    },
    usedInMB() {
      return Math.round(this.statics.bytesLoaded / 1024 / 1024);
    },
    cacheRate() {
      return (this.statics.cacheHit / this.statics.numOfImageLoaded * 100).toFixed(1);
    }
  },
  methods: {
    async getStaticInfo() {
      this.statics = await got.get("http://localhost:39871/statics", {
        timeout: {
          request: 2 * 1000
        }
      }).json();
    },
    donate() {

    }
  }
};
</script>

<style scoped>

</style>