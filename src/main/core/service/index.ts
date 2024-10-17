import { db } from "../db";
import { DownloaderService } from "./Downloader";
import { SettingManageService } from "./SettingManage";
import { settingManage } from "../SettingManage";
import taskRepository from "../db/Task";

let downloaderService: DownloaderService;
let settingManageService: SettingManageService;

export const initService = async (win: Electron.BrowserWindow) => {
  console.log("Service initialized");
  await settingManage.initConfig();
  downloaderService = new DownloaderService(win);
  settingManageService = new SettingManageService();
};

export const closeService = () => {
  console.log("Service closed");
  taskRepository.close();
  downloaderService.close();
  db.close();
  settingManageService.close();
};
