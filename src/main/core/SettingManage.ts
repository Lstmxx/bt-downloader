import { SettingConfig } from "@shared/type";
import Store from "electron-store";
import { getConfigBasePath, getDownloadPath } from "../utils/path";
import { ipcMain } from "electron";
import { IPC_CONFIG_CHANNEL } from "@shared/ipc";

export class SettingManage {
  configStore!: Store<SettingConfig>;

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
    this.configStore = new Store<SettingConfig>({
      name: "config",
      cwd: getConfigBasePath(),
      defaults: {
        downloadPath: getDownloadPath(),
      },
    });
  }
  getConfig() {
    return this.configStore.store;
  }
}
