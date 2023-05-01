<template>
  <div class="alert shadow-lg" v-if="this.optionStore.firstTime">
    <div>
      <div>
        <h3 class="font-bold">First time usage</h3>
        <div class="text-xs"> A self-signed certificate will be generated and added into trust store when you enable
          this mod for
          the
          first time.
          Please accept the pop-up window otherwise this mod will not work.
        </div>
      </div>
    </div>
    <div class="flex-none">
      <button class="btn btn-sm" @click="donotshow">Ok!</button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useOptionStore } from "../../stores/optionStore";

export default defineComponent({
  name: "FirstTime",
  data() {
    let optionStore = useOptionStore();
    return {
      optionStore
    };
  },
  methods: {
    donotshow() {
      this.optionStore.firstTime = false;
    }
  }
});
</script>

<style scoped>

</style>