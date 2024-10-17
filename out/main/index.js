import { ipcMain, dialog, app, Notification, BrowserWindow, shell } from "electron";
import path, { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { PrimaryColumn, Column, OneToMany, Entity, ManyToOne, DataSource } from "typeorm";
import Webtorrent from "webtorrent";
import fs, { promises } from "node:fs";
import Store from "electron-store";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const icon = join(__dirname, "../../resources/icon.png");
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
var TASK_STATUS = /* @__PURE__ */ ((TASK_STATUS2) => {
  TASK_STATUS2["DOWNLOADING"] = "downloading";
  TASK_STATUS2["PAUSED"] = "paused";
  TASK_STATUS2["DONE"] = "done";
  return TASK_STATUS2;
})(TASK_STATUS || {});
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
let TaskModel = class {
  id;
  infoHash;
  magnetURI;
  status;
  createTime;
  path;
  name;
  progress;
  length;
  downloaded;
  files;
};
__decorateClass([
  PrimaryColumn({ type: "int" })
], TaskModel.prototype, "id", 2);
__decorateClass([
  Column({ type: "text", nullable: false })
], TaskModel.prototype, "infoHash", 2);
__decorateClass([
  Column({ type: "text", nullable: false })
], TaskModel.prototype, "magnetURI", 2);
__decorateClass([
  Column({ type: "text", enum: TASK_STATUS, default: TASK_STATUS.PAUSED, nullable: false })
], TaskModel.prototype, "status", 2);
__decorateClass([
  Column({ type: "date", nullable: false })
], TaskModel.prototype, "createTime", 2);
__decorateClass([
  Column({ type: "text", nullable: false })
], TaskModel.prototype, "path", 2);
__decorateClass([
  Column({ type: "text", nullable: false })
], TaskModel.prototype, "name", 2);
__decorateClass([
  Column({ type: "bigint", nullable: false })
], TaskModel.prototype, "progress", 2);
__decorateClass([
  Column({ type: "bigint", nullable: false })
], TaskModel.prototype, "length", 2);
__decorateClass([
  Column({ type: "int", nullable: false })
], TaskModel.prototype, "downloaded", 2);
__decorateClass([
  OneToMany(() => FileModel, (file) => file.task)
], TaskModel.prototype, "files", 2);
TaskModel = __decorateClass([
  Entity()
], TaskModel);
let FileModel = class {
  id;
  name;
  length;
  path;
  downloaded;
  task;
};
__decorateClass([
  PrimaryColumn({ type: "int" })
], FileModel.prototype, "id", 2);
__decorateClass([
  Column({ type: "text", nullable: false })
], FileModel.prototype, "name", 2);
__decorateClass([
  Column({ type: "bigint", nullable: false })
], FileModel.prototype, "length", 2);
__decorateClass([
  Column({ type: "text", nullable: false })
], FileModel.prototype, "path", 2);
__decorateClass([
  Column({ type: "int", nullable: false })
], FileModel.prototype, "downloaded", 2);
__decorateClass([
  ManyToOne(() => TaskModel, (task) => task.files)
], FileModel.prototype, "task", 2);
FileModel = __decorateClass([
  Entity()
], FileModel);
class DataBase {
  dataSource;
  //初始化数据库文件
  constructor(database) {
    const basePath = path.join(app.getPath("appData"), app.getName(), `./${database}.sql`);
    const options = {
      type: "better-sqlite3",
      entities: [TaskModel, FileModel],
      database: basePath,
      synchronize: true
    };
    this.dataSource = new DataSource(options);
    console.log("db_path", basePath, this.dataSource);
  }
  close() {
    this.dataSource.destroy();
  }
}
const DB_NAME = "DATA";
const db = new DataBase(DB_NAME);
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
const torrentToTaskInfo = (torrent) => {
  return {
    infoHash: torrent.infoHash,
    magnetURI: torrent.magnetURI,
    files: torrentFileToFile(torrent.files),
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    progress: torrent.progress,
    length: torrent.length,
    name: torrent.name,
    createTime: torrent.created,
    maxWebConns: torrent.maxWebConns,
    path: torrent.path,
    status: torrent.paused ? TASK_STATUS.PAUSED : torrent.done ? TASK_STATUS.DONE : TASK_STATUS.DOWNLOADING,
    downloaded: torrent.downloaded
  };
};
const torrentFileToFileModel = (file) => {
  const fileModel = new FileModel();
  fileModel.downloaded = file.downloaded;
  fileModel.length = file.length;
  fileModel.name = file.name;
  fileModel.path = file.path;
  return fileModel;
};
const taskInfoToTaskModel = (taskInfo) => {
  const taskModel = new TaskModel();
  taskModel.createTime = taskInfo.createTime;
  if (taskInfo.id) {
    taskModel.id = taskInfo.id;
  }
  taskModel.infoHash = taskInfo.infoHash;
  taskModel.magnetURI = taskInfo.magnetURI;
  taskModel.name = taskInfo.name;
  taskModel.path = taskInfo.path;
  taskModel.progress = taskInfo.progress;
  taskModel.status = taskInfo.status;
  taskModel.downloaded = taskInfo.downloaded;
  taskModel.length = taskInfo.length;
  taskModel.files = taskInfo.files.map(torrentFileToFileModel);
  return taskModel;
};
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
const filePath = path.join(__dirname, "../../resources/best-tracker-list.txt");
console.log("filePath", filePath);
const getAnnounce = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const dataList = data.split("\n").filter((line) => line.trim() !== "");
        resolve(dataList);
      }
    });
  });
};
class SettingManage {
  configStore;
  constructor() {
    console.log("SettingManage init");
  }
  async initConfig() {
    const announce = await getAnnounce();
    this.configStore = new Store({
      name: "config",
      cwd: getConfigBasePath(),
      defaults: {
        downloadPath: getDownloadPath(),
        clientOptions: {
          maxConns: 55,
          tracker: {
            announce
          },
          utp: true,
          webSeeds: true,
          blocklist: [],
          downloadLimit: -1,
          uploadLimit: -1
        }
      }
    });
  }
  getConfig() {
    return this.configStore.store;
  }
  getClientConfig() {
    return this.configStore.store.clientOptions;
  }
}
const settingManage = new SettingManage();
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
  }
  initWebtorrent() {
    const config = settingManage.getClientConfig();
    this.instance = new Webtorrent(config);
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
  handleTorrentProgressUpdate(torrent) {
    console.log(`${torrent.name} progress:`, torrent.progress);
  }
  async startDownload(torrentList, options) {
    const result = [];
    const promiseList = [];
    const handleTorrent = async (item) => {
      const t = await this.instance.get(item.magnetURI);
      if (t) {
        this.instance.remove(t);
        result.push(torrentToTaskInfo(t));
        this.downloadingTasks.push(t);
        return;
      }
      await new Promise((resolve, reject) => {
        this.instance.add(item.magnetURI, { path: options.downloadPath }, (torrent) => {
          this.selectFilesInTorrent(torrent, item.selectFiles);
          result.push(torrentToTaskInfo(torrent));
          this.downloadingTasks.push(torrent);
          resolve(null);
          torrent.on("done", () => {
            this.handleTorrentDone(torrent);
          });
          torrent.on("error", () => {
            reject(null);
          });
        });
      });
    };
    torrentList.forEach((item) => {
      promiseList.push(handleTorrent(item));
    });
    await Promise.all(promiseList);
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
  async resumeTorrent(magnetURI) {
    const t = await this.instance.get(magnetURI);
    if (t) {
      t.resume();
      this.pausedTasks = this.pausedTasks.filter((item) => item.magnetURI !== magnetURI);
      this.downloadingTasks.push(t);
    }
  }
  async deleteTorrent(magnetURI) {
    const t = await this.instance.get(magnetURI);
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
class TaskService {
  static instance;
  dataSource;
  //使用单例模式
  static getInstance() {
    if (!this.instance) {
      this.instance = new TaskService();
    }
    return this.instance;
  }
  constructor() {
    this.dataSource = db.dataSource;
  }
  //初始化主角进程监听事件
  //实现新增方法
  async create(tasks) {
    await this.dataSource.initialize();
    console.log("taskModels", tasks);
    const res = await this.dataSource.manager.save(tasks);
    console.log("res", res);
    await this.dataSource.destroy();
    return res;
  }
  async update(tasks) {
    await this.dataSource.initialize();
    const res = await this.dataSource.manager.save(tasks);
    await this.dataSource.destroy();
    return res;
  }
  //实现分页查询
  async getList(options) {
    await this.dataSource.initialize();
    const sort = options.sort === 2 ? "ASC" : "DESC";
    const listAndCount = await this.dataSource.createQueryBuilder(TaskModel, "task").orderBy("task.createTime", sort).getManyAndCount();
    await this.dataSource.destroy();
    return { list: listAndCount[0], count: listAndCount[1] };
  }
  close() {
    this.dataSource.destroy();
    console.log("TaskService closed");
  }
}
class DownloaderService {
  downloaderInstance;
  taskService;
  constructor(win) {
    this.initListeners();
    this.downloaderInstance = new Downloader(win);
    this.taskService = new TaskService();
    this.initData();
  }
  initListeners() {
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_URL, async (_, magnetURI) => {
      return this.downloaderInstance.getFilesByUrl(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_TORRENT_FILE, async () => {
      return this.downloaderInstance.getFilesByTorrentFile();
    });
    ipcMain.handle(
      IPC_CHANNEL.START_DOWNLOAD,
      async (_, torrentList, options) => {
        const result = await this.downloaderInstance.startDownload(torrentList, options);
        console.log("startDownload", result);
        const taskModels = result.map(taskInfoToTaskModel);
        const databaseResult = await this.taskService.create(taskModels);
        console.log("databaseResult", databaseResult);
        return result;
      }
    );
    ipcMain.handle(IPC_CHANNEL.GET_DOWNLOADING_TASKS, () => {
      return this.downloaderInstance.getDownloadingTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_DONE_TASKS, () => {
      return this.downloaderInstance.getDoneTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_PAUSED_TASKS, () => {
      return this.downloaderInstance.getPausedTasks();
    });
    ipcMain.handle(IPC_CHANNEL.PAUSE_TORRENT, (_, magnetURI) => {
      this.downloaderInstance.pauseTorrent(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.RESUME_TORRENT, (_, magnetURI) => {
      this.downloaderInstance.resumeTorrent(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.DELETE_TORRENT, (_, magnetURI) => {
      this.downloaderInstance.deleteTorrent(magnetURI);
    });
  }
  async initData() {
    const { count, list } = await this.taskService.getList({ pageNum: 1, pageSize: 100, sort: 2 });
    console.log(count, list);
  }
  close() {
    this.downloaderInstance.destroy();
  }
}
class SettingManageService {
  constructor() {
    this.initListeners();
  }
  initListeners() {
    ipcMain.handle(IPC_CONFIG_CHANNEL.GET_CONFIG, () => {
      return settingManage.getConfig();
    });
  }
  close() {
    console.log("close");
  }
}
let taskService;
let downloaderService;
let settingManageService;
const initService = async (win) => {
  console.log("Service initialized");
  await settingManage.initConfig();
  taskService = new TaskService();
  downloaderService = new DownloaderService(win);
  settingManageService = new SettingManageService();
};
const closeService = () => {
  console.log("Service closed");
  taskService.close();
  downloaderService.close();
  db.close();
  settingManageService.close();
};
let mainWindow;
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
  initService(mainWindow);
  initDialog();
  app.on("activate", function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  closeService();
});
