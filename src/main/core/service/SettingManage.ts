import { IPC_CONFIG_CHANNEL } from "@shared/ipc";
import { ipcMain } from "electron";
import { settingManage } from "../SettingManage";

export class SettingManageService {
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
