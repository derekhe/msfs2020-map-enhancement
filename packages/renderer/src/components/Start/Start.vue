<template>
  <div class="space-y-5 relative h-full">
    <div class="card lg:card-side bg-base-100 shadow-xl">
      <figure>
        <img src="../../../public/images/msfs-2020-google-map-replacement-E4kAr.webp"
             alt="Album"
             class="w-96"
        >
      </figure>
      <div class="card-body">
        <h2 class="card-title">{{ optionStore.selectedServer }}</h2>
        <p>{{ description }}</p>
      </div>
    </div>
    <FirstTime />
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
    <RuntimeInfo v-if="serverCheckSuccess" />
  </div>
</template>

<script>

import { FAQ_PAGE_URL, MapProviders } from "../../const";
import { _ } from "lodash";
import { useOptionStore } from "../../stores/optionStore";
import RuntimeInfo from "./RuntimeInfo.vue";
import { STATUS } from "../../../../consts/constants";
import log from "electron-log";
import { EVENT_START_GAME, EVENT_START_SERVER, EVENT_STOP_SERVER } from "../../../../consts/custom-events";
import got from "got";
import { useStatusStore } from "../../stores/statusStore";
import FirstTime from "./FirstTime.vue";

export default {
  name: "Start",
  components: { FirstTime, RuntimeInfo },
  emits: ["startServer", "stopServer"],
  data() {
    let optionStore = useOptionStore();
    let statusStore = useStatusStore();

    return {
      optionStore,
      statusStore,
      MapProviders,
      STATUS
    };
  },
  computed: {
    providers() {
      return _.keys(MapProviders);
    },
    description() {
      console.log(this.optionStore.selectedServer);
      return MapProviders[this.optionStore.selectedServer].description;
    },
    serverCheckSuccess() {
      return this.statusStore.nginxServerHealthCheckResult === STATUS.Passed && this.statusStore.imageAccessHealthCheckResult === STATUS.Passed;
    }
  },
  watch: {
    "optionStore.selectedServer": async function() {
      if (this.serverCheckSuccess) {
        await this.optionStore.updateServerConfig();
      }
    }
  },
  methods: {
    async startServer() {
      log.info("Starting mod");

      const result = await window.ipcRenderer
        .invoke(EVENT_START_SERVER, JSON.parse(JSON.stringify(this.optionStore)));
      log.info("Start mod result", result);

      if (!result.success) {
        window.open(FAQ_PAGE_URL, "_blank");
        this.$eventBus.emit("show-alert", result.error.message);
        return;
      }

      await this.checkImageAccess();
      await this.checkNginxServer();

      if (this.optionStore.autoStartGame) {
        await window.ipcRenderer
          .invoke(EVENT_START_GAME, {
            distributor: this.optionStore.gameStore
          });
      }
    },
    async stopServer() {
      const result = await window.ipcRenderer
        .invoke(EVENT_STOP_SERVER);

      if (!result.success) {
        this.errorMessage = result.error;
      }

      this.statusStore.nginxServerHealthCheckResult = STATUS.NotStarted;
      this.statusStore.imageAccessHealthCheckResult = STATUS.NotStarted;
    },
    async checkNginxServer() {
      this.statusStore.nginxServerHealthCheckResult = STATUS.Checking;
      const url = "https://khstorelive.azureedge.net/results/v1.20.0/coverage_maps/lod_8/12202100.cov?version=3";

      let options = {
        timeout: {
          request: 3 * 1000
        },
        retry: {
          limit: 3
        },
        rejectUnauthorized: false
      };

      try {
        log.info("Checking nginx server");
        await got(url, options);
      } catch (ex) {
        if (ex instanceof (got.HTTPError)) {
          log.info("Nginx server check result", ex.response.statusCode);
          if (ex.response.statusCode === 404) {
            log.info("Nginx server check passed");
            this.statusStore.nginxServerHealthCheckResult = STATUS.Passed;
          } else {
            this.statusStore.nginxServerHealthCheckResult = STATUS.Failed;
          }
        } else {
          log.error("Nginx server check result", ex);
          this.statusStore.nginxServerHealthCheckResult = STATUS.Failed;
        }
      }
    },
    async checkImageAccess() {
      this.statusStore.imageAccessHealthCheckResult = STATUS.Checking;
      const url = `http://localhost:39871/tiles/akh12101.jpeg?n=z&g=9580`;

      let options = {
        timeout: {
          request: 3 * 1000
        },
        retry: {
          limit: 3
        },
        rejectUnauthorized: false
      };
      try {
        log.info("Checking image access");
        const resp = await got(url, options);

        log.info("image server response", resp.statusCode);

        if (resp.statusCode === 200) {
          this.statusStore.imageAccessHealthCheckResult = STATUS.Passed;
        } else {
          this.statusStore.imageAccessHealthCheckResult = STATUS.Failed;
        }
      } catch (ex) {
        this.statusStore.imageAccessHealthCheckResult = STATUS.Failed;
        log.error("Image server error", ex);
      }
    }
  }
};
</script>

<style scoped>

</style>