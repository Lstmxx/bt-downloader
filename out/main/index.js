import { app, ipcMain, dialog, Notification, BrowserWindow, shell } from "electron";
import path, { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import Store from "electron-store";
import Webtorrent from "webtorrent";
import fs, { promises } from "node:fs";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const icon = join(__dirname, "../../resources/icon.png");
const getUserDataPath = () => {
  return app.getPath("userData");
};
const getDownloadPath = () => {
  return app.getPath("downloads");
};
const getConfigBasePath = () => {
  const path2 = getUserDataPath();
  return path2;
};
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
  DELETE_TORRENT: "downloader:delete-torrent"
};
const IPC_DIALOG_CHANNEL = {
  GET_DICT_PATH: "dialog:get-dict-path"
};
const IPC_CONFIG_CHANNEL = {
  GET_CONFIG: "config:get",
  SET_CONFIG: "config:set"
};
class SettingManage {
  configStore;
  constructor() {
    this.initConfig();
    this.initListeners();
  }
  initListeners() {
    ipcMain.handle(IPC_CONFIG_CHANNEL.GET_CONFIG, () => {
      return this.getConfig();
    });
  }
  initConfig() {
    this.configStore = new Store({
      name: "config",
      cwd: getConfigBasePath(),
      defaults: {
        downloadPath: getDownloadPath()
      }
    });
  }
  getConfig() {
    return this.configStore.store;
  }
}
const torrentFileToFile = (files) => {
  const result = files.map((file) => {
    return {
      name: file.name,
      length: file.length,
      progress: file.progress,
      path: file.path,
      downloaded: file.downloaded
    };
  });
  return result;
};
const torrentPieceToPiece = (pieces) => {
  if (!pieces) return [];
  const result = (pieces || []).map((piece) => {
    return {
      length: piece?.length || 0,
      missing: piece?.missing || 0
    };
  });
  return result;
};
const torrentToTaskInfo = (torrent) => {
  return {
    infoHash: torrent.infoHash,
    magnetURI: torrent.magnetURI,
    torrentFileBlobURL: torrent.torrentFileBlobURL,
    files: torrentFileToFile(torrent.files),
    announce: torrent.announce,
    ["announce-list"]: torrent["announce-list"],
    pieces: torrentPieceToPiece(torrent.pieces),
    timeRemaining: torrent.timeRemaining,
    received: torrent.received,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    progress: torrent.progress,
    ratio: torrent.ratio,
    length: torrent.length,
    pieceLength: torrent.pieceLength,
    lastPieceLength: torrent.lastPieceLength,
    numPeers: torrent.numPeers,
    name: torrent.name,
    created: torrent.created,
    createdBy: torrent.createdBy,
    comment: torrent.comment,
    maxWebConns: torrent.maxWebConns,
    path: torrent.path,
    ready: torrent.ready,
    paused: torrent.paused,
    done: torrent.done
  };
};
const filePath = path.join(__dirname, "../../resources/best-tracker-list.txt");
console.log("filePath", filePath);
const getAnnounce = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const dataList = data.split("\n").filter((line) => line.trim() !== "");
        console.log("dataList", dataList);
        resolve(dataList);
      }
    });
  });
};
const getPathDialog = async (_, defaultPath) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath
  });
  return filePaths;
};
const getFileDialog = async (filters, multi = false) => {
  const properties = multi ? ["openFile", "multiSelections"] : ["openFile"];
  const { filePaths } = await dialog.showOpenDialog({
    properties,
    filters
  });
  return filePaths;
};
const initDialog = () => {
  ipcMain.handle(IPC_DIALOG_CHANNEL.GET_DICT_PATH, getPathDialog);
};
const getTorrentFiles = async (instance, magnetURI) => {
  return new Promise(async (resolve, reject) => {
    const t = await instance.get(magnetURI);
    if (t) {
      instance.remove(t);
    }
    console.log("add:", magnetURI);
    instance.add(magnetURI, function(torrent) {
      torrent.pause();
      console.log("torrent:", torrent);
      resolve({ files: torrent.files, torrent });
      torrent.on("error", (err) => {
        reject(err);
      });
    });
    instance.on("error", (err) => {
      console.log("torrent:", err);
      reject(err);
    });
  });
};
class Downloader {
  instance;
  win;
  downloadingTasks = [];
  pausedTasks = [];
  doneTasks = [];
  constructor(win) {
    this.win = win;
    this.initWebtorrent();
    this.initListeners();
  }
  async initWebtorrent() {
    const announce = await getAnnounce();
    this.instance = new Webtorrent({
      tracker: {
        announce
      }
    });
  }
  initListeners() {
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_URL, async (_, magnetURI) => {
      return this.getFilesByUrl(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_TORRENT_FILE, async () => {
      return this.getFilesByTorrentFile();
    });
    ipcMain.handle(
      IPC_CHANNEL.START_DOWNLOAD,
      (_, torrentList, options) => {
        return this.startDownload(torrentList, options);
      }
    );
    ipcMain.handle(IPC_CHANNEL.GET_DOWNLOADING_TASKS, () => {
      return this.getDownloadingTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_DONE_TASKS, () => {
      return this.getDoneTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_PAUSED_TASKS, () => {
      return this.getPausedTasks();
    });
    ipcMain.handle(IPC_CHANNEL.PAUSE_TORRENT, (_, magnetURI) => {
      this.pauseTorrent(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.RESUME_TORRENT, (_, magnetURI) => {
      this.resumeTorrent(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.DELETE_TORRENT, (_, magnetURI) => {
      this.deleteTorrent(magnetURI);
    });
  }
  async getFilesByUrl(magnetURI) {
    const { files, torrent } = await getTorrentFiles(this.instance, magnetURI);
    return { files: torrentFileToFile(files), magnetURI: torrent.magnetURI };
  }
  async getFilesByTorrentFile() {
    const [path2] = await getFileDialog([{ name: "Torrent", extensions: ["torrent"] }]);
    if (!path2) return;
    const data = await promises.readFile(path2);
    const { files, torrent } = await getTorrentFiles(this.instance, data);
    return { files: torrentFileToFile(files), magnetURI: torrent.magnetURI };
  }
  handleTorrentDone(torrent) {
    const { magnetURI } = torrent;
    const index = this.downloadingTasks.findIndex((item) => item.magnetURI === magnetURI);
    if (index !== -1) {
      this.downloadingTasks.splice(index, 1);
      this.doneTasks.push(torrentToTaskInfo(torrent));
    }
    this.win.webContents.send(IPC_CHANNEL.TORRENT_DONE, magnetURI);
    new Notification({ title: torrent.name, body: "下载完成" }).show();
  }
  selectFilesInTorrent(torrent, selectFiles) {
    torrent.files.forEach((file) => {
      if (selectFiles.includes(file.name)) {
        file.select();
      } else {
        file.deselect();
      }
    });
  }
  getDownloadingTasks() {
    return this.downloadingTasks.map(torrentToTaskInfo);
  }
  getDoneTasks() {
    return this.doneTasks;
  }
  getPausedTasks() {
    return this.pausedTasks.map(torrentToTaskInfo);
  }
  startDownload(torrentList, options) {
    const result = [];
    torrentList.forEach(async (item) => {
      let t = await this.instance.get(item.magnetURI);
      if (t) {
        this.instance.remove(t);
      }
      t = this.instance.add(item.magnetURI, { path: options.downloadPath }, (torrent) => {
        this.selectFilesInTorrent(torrent, item.selectFiles);
        torrent.on("done", () => {
          this.handleTorrentDone(torrent);
        });
      });
      result.push(torrentToTaskInfo(t));
      this.downloadingTasks.push(t);
    });
    return result;
  }
  async pauseTorrent(magnetURI) {
    const t = await this.instance.get(magnetURI);
    if (t) {
      t.pause();
      this.downloadingTasks = this.downloadingTasks.filter((item) => item.magnetURI !== magnetURI);
      this.pausedTasks.push(t);
    }
  }
  resumeTorrent(magnetURI) {
    const t = this.instance.get(magnetURI);
    if (t) {
      t.resume();
      this.pausedTasks = this.pausedTasks.filter((item) => item.magnetURI !== magnetURI);
      this.downloadingTasks.push(t);
    }
  }
  deleteTorrent(magnetURI) {
    const t = this.instance.get(magnetURI);
    if (t) {
      t.pause();
      this.instance.remove(t);
    }
  }
  destroy() {
    this.downloadingTasks.forEach((item) => {
      item.pause();
    });
    this.instance.destroy();
  }
}
let mainWindow;
let downloader;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false
    },
    title: "bt-downloader"
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  const settingManage = new SettingManage();
  console.log(settingManage);
  if (mainWindow) {
    downloader = new Downloader(mainWindow);
    console.log(downloader);
  }
  initDialog();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (downloader) {
    downloader.destroy();
  }
});
//# sourceMappingURL=index.js.map
