<template>
  <div class="flex flex-col h-screen">
    <Navbar/>
    <div class="flex h-full">
      <Menu @menu-clicked="selectMenu" />
      <div class="grow">
        <div class="container p-4 overflow-y-auto">
          <Start v-if="activeMenu === MenuItems.HOME" @startServer="startServer" @stopServer="stopServer" />
          <Options class="h-[42rem]" v-if="activeMenu === MenuItems.OPTION" />
          <About v-if="activeMenu === MenuItems.ABOUT" />
        </div>
      </div>
    </div>
    <Alert :message="errorMessage" />
    <footer class="footer items-center p-2 bg-neutral text-neutral-content">
      <div class="items-center grid-flow-col">
        <ServerStatus name="Image Server" :server-check-result="imageAccessHealthCheckResult" />
        <ServerStatus name="Nginx Server" :server-check-result="nginxServerHealthCheckResult" />
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import Menu from "./components/Menu.vue";
import Start from "./components/Home/Start.vue";
import Options from "./components/Options/Options.vue";
import About from "./components/Home/About.vue";
import ServerStatus from "./components/common/ServerStatus.vue";
import { MenuItems } from "./const";
import {
  EVENT_START_SERVER,
  EVENT_STOP_SERVER
} from "../../consts/custom-events";
import log from "electron-log";
import Alert from "./components/common/Alert.vue";
import got from "got";
import { STATUS } from "../../consts/constants";
import { useOptionStore } from "./stores/optionStore";
import Store from "electron-store";

export default {
  components: { Alert, Start, Navbar, Menu, Options, About, ServerStatus },
  setup() {
    const optionStore = useOptionStore();
    return { optionStore };
  },
  data() {
    return {
      MenuItems: MenuItems,
      activeMenu: MenuItems.HOME,
      errorMessage: "",
      imageAccessHealthCheckResult: STATUS.NotStarted,
      nginxServerHealthCheckResult: STATUS.NotStarted,
      STATUS
    };
  },
  methods: {
    selectMenu(selectedMenu) {
      this.activeMenu = selectedMenu;
    },
    async stopServer() {
      const result = await window.ipcRenderer
        .invoke(EVENT_STOP_SERVER);

      if (!result) {
        this.errorMessage = result.error;
      }

      this.nginxServerHealthCheckResult = STATUS.NotStarted;
      this.imageAccessHealthCheckResult = STATUS.NotStarted;
    },
    async startServer() {
      log.info("Starting mod");

      const result = await window.ipcRenderer
        .invoke(EVENT_START_SERVER, JSON.parse(JSON.stringify(this.optionStore)));
      log.info("Start mod result", result);

      if (!result) {
        this.hasAlert = true;
        this.errorMessage = result.error;
      }

      await this.checkImageAccess();
      await this.checkNginxServer();
    },
    async checkNginxServer() {
      this.nginxServerHealthCheckResult = STATUS.Checking;
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
        if (ex instanceof got.HTTPError) {
          log.info("Nginx server check result", ex.response.statusCode);
          if (ex.response.statusCode === 404) {
            log.info("Nginx server check passed");
            this.nginxServerHealthCheckResult = STATUS.Passed;
          } else {
            this.nginxServerHealthCheckResult = STATUS.Failed;
          }
        } else {
          log.error("Nginx server check result", ex);
          this.nginxServerHealthCheckResult = STATUS.Failed;
        }
      }
    },
    async checkImageAccess() {
      this.imageAccessHealthCheckResult = STATUS.Checking;
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
          this.imageAccessHealthCheckResult = STATUS.Passed;
        } else {
          this.imageAccessHealthCheckResult = STATUS.Failed;
        }
      } catch (ex) {
        this.imageAccessHealthCheckResult = STATUS.Failed;
        log.error("Image server error", ex);
      }
    }
  },
  async mounted() {
    const store = new Store();
    this.optionStore.$subscribe((mutation, state) => {
      console.log("Save state");
      store.set("config", state);
    });
  }
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

.titlebar {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.titlebar-button {
  -webkit-app-region: no-drag;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #292b37;
}

::-webkit-scrollbar-thumb {
  background: #c2caf5;
}

::-webkit-scrollbar-thumb:hover {
  background: #292b37;
}
</style>