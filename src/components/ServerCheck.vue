<template>
  <n-card bordered title="Server check" size="small">
    <n-space vertical size="small">
      <n-space align="start">
        <n-icon size="20" color="#0e7a0d" v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Passed">
          <CheckmarkCircle />
        </n-icon>
        <n-icon size="20" color="#f0a020" v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Failed">
          <CloseCircle />
        </n-icon>
        <n-spin size="smaller" v-if="nginxServerHealthCheckResult === HEALTH_CHECK.Checking" />
        <n-p>Nginx Server Access Check</n-p>
      </n-space>
      <n-space align="start">
        <n-icon size="20" color="#0e7a0d" v-if="imageAccessHealthCheckResult === HEALTH_CHECK.Passed">
          <CheckmarkCircle />
        </n-icon>
        <n-icon size="20" color="#f0a020" v-if="imageAccessHealthCheckResult === HEALTH_CHECK.Failed">
          <CloseCircle />
        </n-icon>
        <n-spin size="smaller" v-if="imageAccessHealthCheckResult === HEALTH_CHECK.Checking" />
        <n-p>Image Server Access Check</n-p>
      </n-space>
    </n-space>
  </n-card>
</template>

<script>
import { HEALTH_CHECK } from "../consts/constants";
import { defineComponent } from "vue";
import { CheckmarkCircle, CloseCircle } from "@vicons/ionicons5";

export default defineComponent({
  name: "ServerCheck",
  components:{
    CheckmarkCircle, CloseCircle
  },
  props: {
    nginxServerHealthCheckResult: HEALTH_CHECK,
    imageAccessHealthCheckResult: HEALTH_CHECK
  },
  data() {
    return {
      HEALTH_CHECK: HEALTH_CHECK
    };
  }
});
</script>