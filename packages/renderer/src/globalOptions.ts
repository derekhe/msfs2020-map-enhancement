import { reactive } from "vue";

export const globalOptions = reactive({
  selectedServer: "Bing (Latest)",
  mapboxAccessToken: null,
  enableHighLOD: false,
  proxyAddress: null,
  cacheLocation: "D:\\cache",
  cacheEnabled: false,
  cacheSizeGB: 10
});