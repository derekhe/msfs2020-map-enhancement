export enum STATUS{
  Checking, Passed, Failed, NotStarted
}

export enum SERVER_STATUS {
  Stopped,
  Starting,
  Started,
}

export const HEALTH_CHECK_EVENT = "HEALTH_CHECK_EVENT";