<template>
  <div class="flex-initial w-38 bg-neutral-focus">
    <ul class="menu bg-neutral-focus w-full">
      <li><a @click="menuClicked(Menus.HOME)">
        <div class="grid w-32 h-8 bg-base-300 place-items-center rounded-lg">Start</div>
      </a></li>
      <li><a @click="menuClicked(Menus.OPTION)">
        <div class="grid w-32 h-8 bg-base-300 place-items-center rounded-lg">Options</div>
      </a></li>
      <li><a @click="menuClicked(Menus.REPORT_ISSUE)">
        <div class="grid w-32 h-8 bg-base-300 place-items-center rounded-lg">Report Issue</div>
      </a></li>
      <li><a @click="menuClicked(Menus.ABOUT)">
        <div class="indicator">
          <span class="indicator-item badge badge-secondary" v-show="this.statusStore.updateInfo">new</span>
          <div class="grid w-32 h-8 bg-base-300 place-items-center rounded-lg">About</div>
        </div>
      </a></li>
    </ul>
  </div>
</template>

<script>
import { MenuItems } from "../const";
import { useStatusStore } from "../stores/statusStore";

export default {
  name: "Menu",
  emits: ["menuClicked"],
  data() {
    let statusStore = useStatusStore();
    return {
      Menus: MenuItems,
      statusStore
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