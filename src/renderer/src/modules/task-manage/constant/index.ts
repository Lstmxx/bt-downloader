export enum TASK_STATUS {
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export const TASK_STATUS_LIST = [
  { value: TASK_STATUS.IN_PROGRESS, label: "进行中" },
  { value: TASK_STATUS.DONE, label: "已完成" },
];
