import { defineStore } from "pinia";
import { STATUS } from "../../../consts/constants";

export const useStatusStore = defineStore({
  id: "status",
  state: () => {
    return {
      imageAccessHealthCheckResult: STATUS.NotStarted,
      nginxServerHealthCheckResult: STATUS.NotStarted
    };
  }
});