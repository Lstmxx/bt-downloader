import { TASK_STATUS } from "@shared/enum";

export const TASK_STATUS_LIST = [
  { value: TASK_STATUS.DOWNLOADING, label: "下载中" },
  { value: TASK_STATUS.PAUSED, label: "已暂停" },
  { value: TASK_STATUS.DONE, label: "已完成" },
];
