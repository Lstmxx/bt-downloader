import Webtorrent from "webtorrent";
import { promises as fs } from "node:fs";
import { Notification } from "electron";

import { IPC_CHANNEL } from "@shared/ipc";
import { GetFilesByUrlRes } from "@shared/type";
import { taskInfoToTaskModel, torrentFileToFile, torrentToTaskInfo } from "../utils/transformer";
import { getFileDialog } from "./dialog";

import { settingManage } from "./SettingManage";
import taskRepository from "./db/Task";

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

  inProgressTasks: Webtorrent.Torrent[] = [];

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
    const { magnetURI, id } = torrent;
    const index = this.inProgressTasks.findIndex((item) => item.magnetURI === magnetURI || item.id === id);
    if (index !== -1) {
      const task = this.inProgressTasks.splice(index, 1);
      // todo save task
      taskRepository.update(taskInfoToTaskModel(torrentToTaskInfo(task[0])));
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

  getInProgressTasks() {
    return this.inProgressTasks.map(torrentToTaskInfo);
  }

  handleTorrentProgressUpdate(torrent: Webtorrent.Torrent) {
    console.log(`${torrent.name} progress:`, torrent.progress);
  }

  async startDownload(
    torrentList: {
      magnetURI: string;
      selectFiles: string[];
    }[],
    options: { downloadPath?: string },
  ) {
    const result: Webtorrent.Torrent[] = [];

    const promiseList: Promise<void>[] = [];

    const handleTorrent = async (item: { magnetURI: string; selectFiles: string[] }) => {
      const t = await this.instance.get(item.magnetURI);

      if (t) {
        this.instance.remove(t);
        result.push(t);
        this.inProgressTasks.push(t);
        return;
      }

      await new Promise((resolve, reject) => {
        this.instance.add(item.magnetURI, { path: options.downloadPath }, (torrent) => {
          this.selectFilesInTorrent(torrent, item.selectFiles);
          result.push(torrent);
          this.inProgressTasks.push(torrent);
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

  async pauseTorrent(id: string) {
    const t = this.inProgressTasks.find((item) => item.id === id);
    if (t) {
      t.pause();
    }
  }

  async resumeTorrent(id: string) {
    const t = this.inProgressTasks.find((item) => item.id === id);
    if (t) {
      t.resume();
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
    this.inProgressTasks.forEach((item) => {
      item.pause();
    });

    this.instance.destroy();
  }
}
