import { getInProgressTasks } from "@renderer/api/task";
import { loop } from "@renderer/core/utils/loop";
import { TaskInfo } from "@shared/type";
import { ref } from "vue";

type Props = {
  handleSuccess: (taskInfos: TaskInfo[]) => void;
  handleError: () => void;
};

export function useLoopGetDownloadingTasksInfo({ handleSuccess, handleError }: Props) {
  const isLooping = ref(false);

  const loopFn = async () => {
    isLooping.value = true;
    try {
      const taskInfos = await getInProgressTasks();
      handleSuccess(taskInfos);
      return true;
    } catch (error) {
      console.log(error);
      handleError();
      return true;
    }
  };

  const { start, stop } = loop(loopFn, { interval: 300 });

  const stopLoop = () => {
    isLooping.value = false;
    stop();
  };

  const startLoop = async () => {
    if (isLooping.value) return;
    start();
  };

  return {
    isLooping,
    startLoop,
    stopLoop,
  };
}
