<template>
  <div class="flex flex-col h-screen">
    <Navbar />
    <div class="flex h-full">
      <Menu @menu-clicked="selectMenu" />
      <div class="grow">
        <div class="container p-8 overflow-y-auto">
          <Start v-if="activeMenu === MenuItems.HOME" @startServer="startServer" />
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
import Start from "./components/Home/Home.vue";
import Options from "./components/Options/Options.vue";
import About from "./components/Home/About.vue";
import ServerStatus from "./components/common/ServerStatus.vue";
import { MenuItems } from "./const";
import { EVENT_CHECK_PORT, EVENT_START_HOSTS_PATH, EVENT_START_SERVER } from "../../consts/custom-events";
import { globalOptions } from "./globalOptions";
import log from "electron-log";
import Alert from "./components/common/Alert.vue";
import got from "got";
import { HEALTH_CHECK } from "../../consts/constants";

export default {
  components: { Alert, Start, Navbar, Menu, Options, About, ServerStatus },
  data() {
    return {
      MenuItems: MenuItems,
      activeMenu: MenuItems.HOME,
      globalOptions,
      errorMessage: "",
      imageAccessHealthCheckResult: HEALTH_CHECK.NotStarted,
      nginxServerHealthCheckResult: HEALTH_CHECK.NotStarted,
      HEALTH_CHECK
    };
  },
  methods: {
    selectMenu(selectedMenu) {
      this.activeMenu = selectedMenu;
    },
    async startServer(serverName) {
      console.log("Fly with", serverName);
      globalOptions.selectedServer = serverName;

      const result = await window.ipcRenderer
        .invoke(EVENT_START_HOSTS_PATH);
      log.info("Path result", result);

      if (!result) {
        this.errorMessage = result.error;
      }

      await this.checkNginxServer();
    },
    async checkNginxServer() {
      this.nginxServerHealthCheckResult = HEALTH_CHECK.Checking;
      const url = "https://khstorelive.azureedge.net/results/v1.20.0/coverage_maps/lod_8/12202100.cov?version=3";

      let options = {
        timeout: {
          request: 15 * 1000
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
            this.nginxServerHealthCheckResult = HEALTH_CHECK.Passed;
          } else {
            this.nginxServerHealthCheckResult = HEALTH_CHECK.Failed;
          }
        } else {
          log.error("Nginx server check result", ex);
          this.nginxServerHealthCheckResult = HEALTH_CHECK.Failed;
        }
      }
    },
    async checkImageAccess() {
      this.imageAccessHealthCheckResult = HEALTH_CHECK.Checking;
      const url = `http://localhost:39871/tiles/akh12101.jpeg?n=z&g=9580`;

      let options = {
        timeout: {
          request: 5 * 1000
        },
        rejectUnauthorized: false
      };
      try {
        log.info("Checking image access");
        const resp = await got(url, options);

        log.info("image server response", resp.statusCode);

        if (resp.statusCode === 200) {
          this.imageAccessHealthCheckResult = HEALTH_CHECK.Passed;
        } else {
          this.imageAccessHealthCheckResult = HEALTH_CHECK.Failed;
        }
      } catch (ex) {
        this.imageAccessHealthCheckResult = HEALTH_CHECK.Failed;
        log.error("Image server error", ex);
      }
    },
  },
  async mounted() {
    log.info("Starting mod");
    const result = await window.ipcRenderer
      .invoke(EVENT_START_SERVER, JSON.parse(JSON.stringify(globalOptions)));
    log.info("Start mod result", result);

    if (!result) {
      this.hasAlert = true;
      this.errorMessage = result.error;
    }

    await this.checkImageAccess();
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