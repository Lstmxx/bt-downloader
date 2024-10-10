import { SettingConfig } from "@shared/type";
import Store from "electron-store";
import { getConfigBasePath, getDownloadPath } from "../utils/path";
import WebTorrent from "webtorrent";
import { getAnnounce } from "../utils/announce";

class SettingManage {
  configStore!: Store<SettingConfig>;

  constructor() {
    console.log("SettingManage init");
  }

  async initConfig() {
    const announce = await getAnnounce();
    this.configStore = new Store<SettingConfig>({
      name: "config",
      cwd: getConfigBasePath(),
      defaults: {
        downloadPath: getDownloadPath(),
        clientOptions: {
          maxConns: 55,
          tracker: {
            announce,
          },
          utp: true,
          webSeeds: true,
          blocklist: [],
          downloadLimit: -1,
          uploadLimit: -1,
        },
      },
    });
  }
  getConfig() {
    return this.configStore.store;
  }
  getClientConfig(): WebTorrent.Options {
    return this.configStore.store.clientOptions;
  }
}

export const settingManage = new SettingManage();
