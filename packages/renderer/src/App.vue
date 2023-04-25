<template>
  <div class="flex flex-col h-screen">
    <Navbar />
    <div class="flex h-full">
      <Menu @menu-clicked="selectMenu" />
      <div class="grow">
        <div class="container mx-auto p-8">
          <Start v-if="activeMenu === MenuItems.HOME" />
          <Options v-if="activeMenu === MenuItems.OPTION" />
          <About v-if="activeMenu === MenuItems.ABOUT" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import Menu from "./components/Menu.vue";
import Start from "./components/Home/Home.vue";
import Options from "./components/Options/Options.vue";
import About from "./components/Home/About.vue";
import { MenuItems } from "./const";

export default {
  components: { Start, Navbar, Menu, Options, About },
  data() {
    return {
      MenuItems: MenuItems,
      activeMenu: MenuItems.HOME
    };
  },
  methods: {
    selectMenu(selectedMenu) {
      this.activeMenu = selectedMenu;
    }
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
</style>