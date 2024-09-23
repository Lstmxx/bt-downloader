import { resumeTorrent, pauseTorrent, deleteTorrent } from "@renderer/api/task";
import { TaskInfo } from "@shared/type";
import { debounce } from "lodash-es";

export const useHandler = (props: { readonly task: TaskInfo }) => {
  const handleResume = debounce(() => {
    resumeTorrent(props.task.magnetURI);
  });
  const handlePause = debounce(() => {
    pauseTorrent(props.task.magnetURI);
  });
  const handleDelete = debounce(() => {
    deleteTorrent(props.task.magnetURI);
  });

  return {
    handleResume,
    handlePause,
    handleDelete,
  };
};
