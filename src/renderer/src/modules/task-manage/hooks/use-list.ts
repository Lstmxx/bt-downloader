import { ref, shallowRef, onMounted, onUnmounted, watch } from "vue";
import { TaskInfo } from "@shared/type";

import { useLoopGetDownloadingTasksInfo } from "./use-loop-get-tasks-info";
import { getInProgressTasks } from "@renderer/api/task";
import { TASK_STATUS } from "../constant";

export const useList = () => {
  const currentStatus = ref(TASK_STATUS.IN_PROGRESS);

  const taskInfos = shallowRef<TaskInfo[]>([]);

  const handleInProgressTasks = async () => {
    taskInfos.value = await getInProgressTasks();
  };

  const { startLoop, stopLoop } = useLoopGetDownloadingTasksInfo({
    handleSuccess(result) {
      console.log("loop", result);
      if (currentStatus.value === TASK_STATUS.IN_PROGRESS) {
        taskInfos.value = result;
      }
    },
    handleError() {
      console.error("获取任务列表失败");
    },
  });

  const getTaskFnMap = {
    [TASK_STATUS.DONE]: handleInProgressTasks,
    [TASK_STATUS.IN_PROGRESS]: startLoop,
  };

  const updateTaskInfos = (status: TASK_STATUS) => {
    stopLoop();
    const fn = getTaskFnMap[status];
    fn();
  };

  watch(
    currentStatus,
    (status) => {
      updateTaskInfos(status);
    },
    {
      immediate: true,
    },
  );

  const handleTorrentDone = () => {
    updateTaskInfos(currentStatus.value);
  };

  onMounted(() => {
    window.api.onTorrentDone(handleTorrentDone);
  });

  onUnmounted(() => {
    stopLoop();
  });

  return {
    currentStatus,
    taskInfos,
  };
};
