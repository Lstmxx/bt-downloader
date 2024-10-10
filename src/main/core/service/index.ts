import { db } from "../db";
import { DownloaderService } from "./Downloader";
import { TaskService } from "../db/Task";
import { SettingManageService } from "./SettingManage";
import { settingManage } from "../SettingManage";

let taskService: TaskService;
let downloaderService: DownloaderService;
let settingManageService: SettingManageService;

export const initService = async (win: Electron.BrowserWindow) => {
  console.log("Service initialized");
  await settingManage.initConfig();
  taskService = new TaskService();
  downloaderService = new DownloaderService(win);
  settingManageService = new SettingManageService();
};

export const closeService = () => {
  console.log("Service closed");
  taskService.close();
  downloaderService.close();
  db.close();
  settingManageService.close();
};
