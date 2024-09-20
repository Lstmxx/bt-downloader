import { IPC_CHANNEL } from "@shared/ipc";
import { GetFilesByUrlRes, TaskInfo } from "@shared/type";

export const getTorrentFilesByUrl = async (torrentUrl: string) => {
  const files = (await window.ipcRenderer.invoke(IPC_CHANNEL.GET_FILES_BY_URL, torrentUrl)) as GetFilesByUrlRes;
  return files;
};

export const startDownload = async (
  torrentList: {
    magnetURI: string;
    selectFiles: string[];
  }[],
  options: { downloadPath?: string },
) => {
  const result = (await window.ipcRenderer.invoke(IPC_CHANNEL.START_DOWNLOAD, torrentList, options)) as TaskInfo[];
  return result;
};

export const getDownloadingTasks = async () => {
  const tasks = (await window.ipcRenderer.invoke(IPC_CHANNEL.GET_DOWNLOADING_TASKS)) as TaskInfo[];
  return tasks;
};

export const getDoneTasks = async () => {
  const tasks = (await window.ipcRenderer.invoke(IPC_CHANNEL.GET_DONE_TASKS)) as TaskInfo[];
  return tasks;
};
