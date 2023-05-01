<template>
  <div class="flex flex-col h-screen">
    <Navbar />
    <div class="flex h-full">
      <Menu @menu-clicked="selectMenu" />
      <div class="grow">
        <div class="container p-4 overflow-y-auto h-full">
          <Start v-if="activeMenu === MenuItems.HOME" />
          <Options class="h-[42rem]" v-if="activeMenu === MenuItems.OPTION" />
          <About v-if="activeMenu === MenuItems.ABOUT" />
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
import { MenuItems } from "./const";
import Alert from "./components/common/Alert.vue";
import { useOptionStore } from "./stores/optionStore";
import Store from "electron-store";
import { useStatusStore } from "./stores/statusStore";

export default {
  components: { Alert, Start, Navbar, Menu, Options, About, ServerStatus },
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
    }
  },
  async mounted() {
    const store = new Store();
    this.optionStore.$subscribe((mutation, state) => {
      console.log("Save state");
      store.set("config", state);
    });

    this.$eventBus.on("show-alert", (e) => {
      console.log("received alert", e);
      this.errorMessage = e.message;
      this.alertEnabled = true;
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