/* eslint-disable @typescript-eslint/no-explicit-any */
import Webtorrent from "webtorrent";
import { promises as fs } from "node:fs";
import { Notification } from "electron";

import { DOWNLOAD_IPC_CHANNEL } from "@shared/ipc";
import { GetFilesByUrlRes, TaskInfo } from "@shared/type";
import { taskInfoToTaskModel, taskModelToTaskInfo, torrentFileToFile, torrentToTaskInfo } from "../utils/transformer";
import { getFileDialog } from "./dialog";

import { settingManage } from "./SettingManage";
import taskRepository from "./db/Task";
import { TaskModel } from "./db/model";

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
  inProgressTaskInfo: TaskInfo[] = [];

  constructor(win: Electron.BrowserWindow) {
    this.win = win;
    this.initWebtorrent();
  }

  initWebtorrent() {
    const config = settingManage.getClientConfig();
    this.instance = new Webtorrent(config);
  }

  setSpeed(uploadSpeed: number, downloadSpeed: number) {
    (this.instance as any).throttleDownload(downloadSpeed);
    (this.instance as any).throttleUpload(uploadSpeed);
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
      taskRepository.update([taskInfoToTaskModel(torrentToTaskInfo(task[0]))]);
    }
    this.win.webContents.send(DOWNLOAD_IPC_CHANNEL.TORRENT_DONE, magnetURI);
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
    return [...this.inProgressTaskInfo, ...this.inProgressTasks.map(torrentToTaskInfo)];
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

  async addTorrentsFromTaskModel(taskModels: TaskModel[]) {
    const taskInfos = taskModels.map(taskModelToTaskInfo);
    this.inProgressTaskInfo.push(...taskInfos);

    const result: Webtorrent.Torrent[] = [];

    const promiseList: Promise<void>[] = [];

    const handleTorrent = async (item: { magnetURI: string; selectFiles: string[]; path: string; id: string }) => {
      const t = await this.instance.get(item.magnetURI);

      if (t) {
        this.instance.remove(t);
      }

      await new Promise((resolve, reject) => {
        this.instance.add(item.magnetURI, { path: item.path }, (torrent) => {
          this.selectFilesInTorrent(torrent, item.selectFiles);
          torrent.id = item.id;
          result.push(torrent);
          torrent.pause();
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

    taskInfos.forEach((item) => {
      promiseList.push(
        handleTorrent({
          magnetURI: item.magnetURI,
          selectFiles: item.files.map((item) => item.name),
          path: item.path,
          id: item.id || "",
        }),
      );
    });

    await Promise.all(promiseList);

    console.log("add torrents", result);

    result.forEach((item) => {
      const { id } = item;
      const index = this.inProgressTaskInfo.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.inProgressTaskInfo.splice(index);
      }
      this.inProgressTasks.push(item);
    });

    return result;
  }

  async pauseTorrent(id: string) {
    console.log("parse", id);
    const t = this.inProgressTasks.find((item) => item.id === id);
    console.log("pause", t);
    if (t) {
      t.pause();
    }
    return t;
  }

  async resumeTorrent(id: string) {
    console.log("resume", id);
    const t = this.inProgressTasks.find((item) => item.id === id);
    if (t) {
      t.resume();
      console.log("resume", t.done, t.paused);
    }
    return t;
  }

  async deleteTorrent(id: string) {
    const index = this.inProgressTasks.findIndex((item) => item.id === id);
    if (index !== -1) {
      const t = this.inProgressTasks.splice(index, 1)[0];
      t.pause();
      this.instance.remove(t);
      return true;
    }
    return false;
  }

  destroy() {
    this.inProgressTasks.forEach((item) => {
      item.pause();
    });

    this.instance.destroy();
  }
}
