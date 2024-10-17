import { resumeTorrent, pauseTorrent, deleteTorrent } from "@renderer/api/task";
import { TaskInfo } from "@shared/type";
import { debounce } from "lodash-es";
import { useToast } from "primevue/usetoast";

export const useHandler = (props: { readonly task: TaskInfo }) => {
  const toast = useToast();

  const handleResume = debounce(async () => {
    await resumeTorrent(props.task.id || props.task.magnetURI);
    toast.add({ severity: "success", summary: "重启成功", detail: `${props.task.name} 重启成功`, life: 3000 });
  });
  const handlePause = debounce(async () => {
    await pauseTorrent(props.task.id || props.task.magnetURI);
    toast.add({ severity: "success", summary: "暂停成功", detail: `${props.task.name} 暂停成功`, life: 3000 });
  });
  const handleDelete = debounce(async () => {
    await deleteTorrent(props.task.id || props.task.magnetURI);
    toast.add({ severity: "success", summary: "删除成功", detail: `${props.task.name} 删除成功`, life: 3000 });
  });

  return {
    handleResume,
    handlePause,
    handleDelete,
  };
};
