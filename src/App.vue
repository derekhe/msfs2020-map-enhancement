<template>
  <n-message-provider>
    <RouterView />
  </n-message-provider>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  components: {},
  setup() {
    return {};
  }
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
