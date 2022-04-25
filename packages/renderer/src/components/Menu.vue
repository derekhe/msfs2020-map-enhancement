<template>
  <div class="flex-initial w-48 bg-neutral-focus p-4">
    <ul class="menu bg-neutral-focus">
      <li><a @click="menuClicked(Menus.HOME)">Start</a></li>
      <li><a @click="menuClicked(Menus.OPTION)">Options</a></li>
      <li><a @click="menuClicked(Menus.ABOUT)">About</a></li>
    </ul>
  </div>
</template>

<script>
import { MenuItems } from "../const";

export default {
  name: "Menu",
  emits: ["menuClicked"],
  data() {
    return {
      Menus: MenuItems
    };
  },
  methods: {
    menuClicked(selectedMenu) {
      this.$emit("menuClicked", selectedMenu);
    }
  }
};
</script>

<style scoped>

</style>