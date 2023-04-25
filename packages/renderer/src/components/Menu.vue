<template>
  <div class="flex-initial w-48 bg-neutral-focus p-4">
    <ul class="menu bg-neutral-focus">
      <li><a @click="menuClicked(selectedMenu.HOME)">Start</a></li>
      <li><a @click="menuClicked(selectedMenu.OPTION)">Options</a></li>
      <li><a @click="menuClicked(selectedMenu.ABOUT)">About</a></li>
    </ul>
  </div>
</template>

<script>
import {selectedMenu, uiState} from "../uiState";

export default {
  name: "Menu",
  data() {
    return {
      store: uiState, selectedMenu
    }
  },
  methods: {
    menuClicked(selectedMenu) {
      uiState.selectedMenu = selectedMenu;
    }
  }
}
</script>

<style scoped>

</style>