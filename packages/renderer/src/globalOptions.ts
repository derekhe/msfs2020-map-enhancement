import { reactive } from "vue";

export const globalOptions = reactive({
  selectedServer: "Bing Map (Latest)",
  mapboxAccessToken: null,
  enableHighLOD: false,
  proxyAddress: null,
  cacheLocation: "D:\\cache",
  cacheEnabled: false,
  cacheSizeGB: 10
});