<template>
  <div class="flex flex-col h-screen">
    <Navbar />
    <div class="flex h-full">
      <Menu @menu-clicked="selectMenu" />
      <div class="grow">
        <div class="container p-4 overflow-y-auto h-full">
          <Start v-show="activeMenu === MenuItems.HOME" />
          <Options class="h-[42rem]" v-show="activeMenu === MenuItems.OPTION" />
          <About v-show="activeMenu === MenuItems.ABOUT" />
          <ReportIssue v-show="activeMenu===MenuItems.REPORT_ISSUE"/>
        </div>
      </div>
    </div>
    <Alert :message="errorMessage" :enabled="alertEnabled" />
    <footer class="footer items-center p-2 bg-neutral text-neutral-content">
      <div class="items-center grid-flow-col">
        <ServerStatus name="Image Server" :server-check-result="statusStore.imageAccessHealthCheckResult" />
        <ServerStatus name="Nginx Server" :server-check-result="statusStore.nginxServerHealthCheckResult" />
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import Menu from "./components/Menu.vue";
import Start from "./components/Start/Start.vue";
import Options from "./components/Options/Options.vue";
import About from "./components/About/About.vue";
import ServerStatus from "./components/common/ServerStatus.vue";
import ReportIssue from "./components/ReportIssue/ReportIssue.vue";
import { FAQ_PAGE_URL, MenuItems } from "./const";
import Alert from "./components/common/Alert.vue";
import { useOptionStore } from "./stores/optionStore";
import Store from "electron-store";
import { useStatusStore } from "./stores/statusStore";
import { EVENT_CHECK_PORT } from "../../consts/custom-events";
import log from "electron-log";

export default {
  components: { Alert, Start, Navbar, Menu, Options, About, ServerStatus, ReportIssue},
  setup() {
    const optionStore = useOptionStore();
    const statusStore = useStatusStore();
    return { optionStore, statusStore };
  },
  data() {
    return {
      MenuItems: MenuItems,
      activeMenu: MenuItems.HOME,
      errorMessage: "",
      alertEnabled: false
    };
  },
  methods: {
    selectMenu(selectedMenu) {
      this.activeMenu = selectedMenu;
    },
    async check443Port() {
      const result = await window.ipcRenderer.invoke(EVENT_CHECK_PORT);
      if (result) {
        window.open(FAQ_PAGE_URL, "_blank");
        this.$eventBus.emit("show-alert", "443 Port is using, the mod won't work. Please read FAQ to solve the problem and close any application using 443 port");
      }
    }
  },
  async mounted() {
    const store = new Store();
    this.optionStore.$subscribe((mutation, state) => {
      log.info("Save state", state);
      store.set("config", state);
    });

    this.$eventBus.on("show-alert", (msg) => {
      log.info("received alert", msg);
      this.errorMessage = msg;
      this.alertEnabled = true;
    });

    await this.check443Port()
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