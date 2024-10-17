import { DOWNLOAD_IPC_CHANNEL } from "@shared/ipc";
import { GetFilesByTorrentFileRes, GetFilesByUrlRes, TaskInfo } from "@shared/type";

export const getTorrentFilesByUrl = async (magnetURI: string) => {
  const files = (await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.GET_FILES_BY_URL, magnetURI)) as
    | GetFilesByUrlRes
    | undefined;
  return files;
};

export const getTorrentFilesByFile = async () => {
  const files = (await window.ipcRenderer.invoke(
    DOWNLOAD_IPC_CHANNEL.GET_FILES_BY_TORRENT_FILE,
  )) as GetFilesByTorrentFileRes;
  return files;
};

export const startDownload = async (
  torrentList: {
    magnetURI: string;
    selectFiles: string[];
  }[],
  options: { downloadPath?: string },
) => {
  const result = (await window.ipcRenderer.invoke(
    DOWNLOAD_IPC_CHANNEL.START_DOWNLOAD,
    torrentList,
    options,
  )) as TaskInfo[];
  return result;
};

export const getDownloadingTasks = async () => {
  console.log(window.electron);
  const tasks = (await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.GET_DOWNLOADING_TASKS)) as TaskInfo[];
  return tasks;
};

export const getInProgressTasks = async () => {
  const tasks = (await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.GET_IN_PROGRESS_TASKS)) as TaskInfo[];
  return tasks;
};

export const getPausedTasks = async () => {
  const tasks = (await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.GET_PAUSED_TASKS)) as TaskInfo[];
  return tasks;
};

export const pauseTorrent = async (id: string) => {
  await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.PAUSE_TORRENT, id);
};

export const resumeTorrent = async (id: string) => {
  await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.RESUME_TORRENT, id);
};

export const deleteTorrent = async (id: string) => {
  await window.ipcRenderer.invoke(DOWNLOAD_IPC_CHANNEL.DELETE_TORRENT, id);
};
