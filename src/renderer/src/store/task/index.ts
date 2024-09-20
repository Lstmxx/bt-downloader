import { getDoneTasks, getDownloadingTasks } from "@renderer/api/task";
import { TaskInfo } from "@shared/type";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useTaskStore = defineStore("task-store", () => {
  const pausedTaskInfos = ref<TaskInfo[]>([]);

  const doneTaskMap: Map<string, boolean> = new Map();
  const doneTaskInfos = ref<TaskInfo[]>([]);

  const downloadingTaskInfos = ref<TaskInfo[]>([]);

  const handleGetDownloadingTaskInfos = async () => {
    const tasks = await getDownloadingTasks();

    downloadingTaskInfos.value = tasks;
    // todo
  };

  const handleGetDoneTaskInfos = async () => {
    const tasks = await getDoneTasks();
    tasks.forEach((task) => {
      if (!doneTaskMap.has(task.magnetURI)) {
        doneTaskMap.set(task.magnetURI, true);
        doneTaskInfos.value.push(task);
      }
    });
  };

  return {
    pausedTaskInfos,
    doneTaskInfos,
    downloadingTaskInfos,
    handleGetDownloadingTaskInfos,
    handleGetDoneTaskInfos,
  };
});
