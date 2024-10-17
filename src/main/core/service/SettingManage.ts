import { IPC_CONFIG_CHANNEL } from "@shared/ipc";
import { ipcMain } from "electron";
import { settingManage } from "../SettingManage";
import { SettingConfig } from "@shared/type";
import { Downloader } from "../Downloader";

export class SettingManageService {
  downloaderInstance: Downloader;
  constructor(downloaderInstance: Downloader) {
    this.initListeners();
    this.downloaderInstance = downloaderInstance;
  }
  initListeners() {
    ipcMain.handle(IPC_CONFIG_CHANNEL.GET_CONFIG, () => {
      return settingManage.getConfig();
    });
    ipcMain.handle(IPC_CONFIG_CHANNEL.SET_CONFIG, (_, config: SettingConfig) => {
      const result = settingManage.setConfig(config);

      this.setSpeed(result.clientOptions.uploadLimit || -1, result.clientOptions.downloadLimit || -1);

      return result;
    });
  }

  setSpeed(uploadSpeed: number, downloadSpeed: number) {
    this.downloaderInstance.setSpeed(uploadSpeed, downloadSpeed);
  }

  close() {
    console.log("close");
  }
}
