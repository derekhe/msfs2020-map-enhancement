<template>
  <div class="card full bg-base-100 shadow-xl">
    <div class="card-body text-base">
      <h2 class="card-title">Licence</h2>
      <div class="form-control">
        <div class="space-y-2 space-x-2">
          <label class="input-group">
            <span>Code</span>
            <input type="text" placeholder="" class="input input-bordered w-full" v-model="optionStore.license">
          </label>
          <button class="btn w-24" @click="checkLicence">Check</button>
          <div class="badge badge-success gap-2" v-if="licenceCheckResult === licenceCheckStatus.Passed">
            success
          </div>
          <div class="badge badge-error gap-2" v-if="licenceCheckResult === licenceCheckStatus.Failed">
            invalid license
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useOptionStore } from "../../stores/optionStore";
import { EVENT_CHECK_LICENCE } from "../../../../consts/custom-events";
import { STATUS } from "../../../../consts/constants";
import log from "electron-log";

export default {
  name: "License",
  setup() {
    let optionStore = useOptionStore();
    return {
      optionStore
    };
  },
  data() {
    return {
      licenceCheckStatus: STATUS,
      licenceCheckResult: STATUS.NotStarted
    };
  },
  methods: {
    async checkLicence() {
      log.info("Checking licence");

      let license = await window.ipcRenderer
        .invoke(EVENT_CHECK_LICENCE, this.optionStore.license);

      log.info("Licence check result: " + license);
      if (license === 0) {
        this.licenceCheckResult = STATUS.Passed;
      } else {
        this.licenceCheckResult = STATUS.Failed;
      }
    }
  }
};
</script>

<style scoped>

</style>
