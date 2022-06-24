import { defineStore } from "pinia";
import { STATUS } from "../../../consts/constants";
import moment from "moment";

export const useStatusStore = defineStore({
  id: "status",
  state: () => {
    return {
      imageAccessHealthCheckResult: STATUS.NotStarted,
      nginxServerHealthCheckResult: STATUS.NotStarted,
      updateInfo: undefined,
      appVersion: window.require('@electron/remote').app.getVersion(),
      appStartTime: moment.now()
    };
  }
});