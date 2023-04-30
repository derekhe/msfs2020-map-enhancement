import { defineStore } from "pinia";
import Store from "electron-store";
import { STATUS } from "../../../consts/constants";

export const useStatusStore = defineStore("status", {
  state: () => {
    return {
      imageAccessHealthCheckResult: STATUS.NotStarted,
      nginxServerHealthCheckResult: STATUS.NotStarted
    };
  },
});