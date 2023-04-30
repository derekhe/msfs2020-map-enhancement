<template>
  <p>{{ name }}</p>
  <div class="badge badge-info" v-if="serverCheckResult === HEALTH_CHECK.NotStarted">
    not started
  </div>
  <div class="badge badge-info" v-if="serverCheckResult === HEALTH_CHECK.Checking">
    checking
  </div>
  <div class="badge badge-error" v-if="serverCheckResult === HEALTH_CHECK.Failed">
    failed
  </div>
  <div class="badge badge-success" v-if="serverCheckResult === HEALTH_CHECK.Passed">
    good
  </div>
</template>

<script>
import { STATUS } from "../../../../consts/constants";

export default {
  name: "ServerStatus",
  props: ["name", "serverCheckResult"],
  data() {
    return {
      HEALTH_CHECK: STATUS
    };
  }
};
</script>

<style scoped>

</style>