import Webtorrent from "webtorrent";
import { promises as fs } from "node:fs";
import { Notification } from "electron";

import { IPC_CHANNEL } from "@shared/ipc";
import { TaskInfo, GetFilesByUrlRes } from "@shared/type";
import { torrentFileToFile, torrentToTaskInfo } from "../utils/transformer";
import { getFileDialog } from "./dialog";

import { settingManage } from "./SettingManage";

// const torrentProgress = () => {};

const getTorrentFiles = async (instance: Webtorrent.Instance, magnetURI: string | Buffer) => {
  return new Promise<{ files: Webtorrent.TorrentFile[]; torrent: Webtorrent.Torrent }>(async (resolve, reject) => {
    const t = await instance.get(magnetURI);

    if (t) {
      instance.remove(t);
    }

    console.log("add:", magnetURI);

    instance.add(magnetURI, function (torrent) {
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

export class Downloader {
  instance!: Webtorrent.Instance;
  win: Electron.BrowserWindow;

  downloadingTasks: Webtorrent.Torrent[] = [];
  pausedTasks: Webtorrent.Torrent[] = [];
  doneTasks: TaskInfo[] = [];

  constructor(win: Electron.BrowserWindow) {
    this.win = win;
    this.initWebtorrent();
  }

  initWebtorrent() {
    const config = settingManage.getClientConfig();
    this.instance = new Webtorrent(config);
  }

  async getFilesByUrl(magnetURI: string): Promise<GetFilesByUrlRes> {
    const { files, torrent } = await getTorrentFiles(this.instance, magnetURI);
    return { files: torrentFileToFile(files), magnetURI: torrent.magnetURI };
  }

  async getFilesByTorrentFile() {
    const [path] = await getFileDialog([{ name: "Torrent", extensions: ["torrent"] }]);
    if (!path) return;

    const data = await fs.readFile(path);

    const { files, torrent } = await getTorrentFiles(this.instance, data);

    return { files: torrentFileToFile(files), magnetURI: torrent.magnetURI };
  }

  handleTorrentDone(torrent: Webtorrent.Torrent) {
    const { magnetURI } = torrent;
    const index = this.downloadingTasks.findIndex((item) => item.magnetURI === magnetURI);
    if (index !== -1) {
      this.downloadingTasks.splice(index, 1);
      this.doneTasks.push(torrentToTaskInfo(torrent));
    }
    this.win.webContents.send(IPC_CHANNEL.TORRENT_DONE, magnetURI);
    new Notification({ title: torrent.name, body: "下载完成" }).show();
  }

  selectFilesInTorrent(torrent: Webtorrent.Torrent, selectFiles: string[]) {
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

  handleTorrentProgressUpdate(torrent: Webtorrent.Torrent) {
    console.log(`${torrent.name} progress:`, torrent.progress);
  }

  startDownload(
    torrentList: {
      magnetURI: string;
      selectFiles: string[];
    }[],
    options: { downloadPath?: string },
  ) {
    const result: TaskInfo[] = [];

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

  async pauseTorrent(magnetURI: string) {
    const t = await this.instance.get(magnetURI);
    if (t) {
      t.pause();
      this.downloadingTasks = this.downloadingTasks.filter((item) => item.magnetURI !== magnetURI);
      this.pausedTasks.push(t);
    }
  }

  async resumeTorrent(magnetURI: string) {
    const t = await this.instance.get(magnetURI);
    if (t) {
      t.resume();
      this.pausedTasks = this.pausedTasks.filter((item) => item.magnetURI !== magnetURI);
      this.downloadingTasks.push(t);
    }
  }

  async deleteTorrent(magnetURI: string) {
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
