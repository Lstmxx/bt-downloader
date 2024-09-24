import { ref, shallowRef, onMounted, onUnmounted, watch } from "vue";
import { TaskInfo } from "@shared/type";
import { TASK_STATUS } from "../constant";
import { useLoopGetDownloadingTasksInfo } from "./use-loop-get-tasks-info";
import { getDoneTasks, getPausedTasks } from "@renderer/api/task";

export const useList = () => {
  const currentStatus = ref(TASK_STATUS.DOWNLOADING);

  const taskInfos = shallowRef<TaskInfo[]>([]);

  const handleGetDoneTasks = async () => {
    taskInfos.value = await getDoneTasks();
  };

  const handleGetPausedTasks = async () => {
    taskInfos.value = await getPausedTasks();
  };

  const { startLoop, stopLoop } = useLoopGetDownloadingTasksInfo({
    handleSuccess(result) {
      console.log("loop", result);
      if (currentStatus.value === TASK_STATUS.DOWNLOADING) {
        taskInfos.value = result;
      }
    },
    handleError() {
      console.error("获取任务列表失败");
    },
  });

  const getTaskFnMap = {
    [TASK_STATUS.DONE]: handleGetDoneTasks,
    [TASK_STATUS.PAUSED]: handleGetPausedTasks,
    [TASK_STATUS.DOWNLOADING]: startLoop,
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
