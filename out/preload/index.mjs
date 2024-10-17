import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
const IPC_CHANNEL = {
  GET_FILES_BY_URL: "downloader:get-files-by-url",
  GET_DOWNLOADING_TASKS: "downloader:get-downloading-tasks",
  START_DOWNLOAD: "downloader:start-download",
  TORRENT_DONE: "downloader:torrent-done",
  GET_DONE_TASKS: "downloader:get-done-tasks",
  PAUSE_TORRENT: "downloader:pause-torrent",
  RESUME_TORRENT: "downloader:resume-torrent",
  GET_FILES_BY_TORRENT_FILE: "downloader:get-files-by-torrent-file",
  GET_PAUSED_TASKS: "downloader:get-paused-tasks",
  DELETE_TORRENT: "downloader:delete-torrent",
  GET_IN_PROGRESS_TASKS: "downloader:get-in-progress-tasks"
};
const api = {
  onTorrentDone: (cb) => ipcRenderer.on(IPC_CHANNEL.TORRENT_DONE, (_event, magnetURI) => cb(magnetURI))
};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
