import Webtorrent from "webtorrent";
import { promises as fs } from "node:fs";
import { ipcMain, Notification } from "electron";

import { IPC_CHANNEL } from "@shared/ipc";
import { TaskInfo, GetFilesByUrlRes } from "@shared/type";
import { torrentFileToFile, torrentToTaskInfo } from "../utils/transformer";
import { getAnnounce } from "../utils/announce";
import { getFileDialog } from "./dialog";

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
    this.initListeners();
  }

  async initWebtorrent() {
    const announce = await getAnnounce();
    this.instance = new Webtorrent({
      tracker: {
        announce,
      },
    });
  }

  initListeners() {
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_URL, async (_, magnetURI: string): Promise<GetFilesByUrlRes> => {
      return this.getFilesByUrl(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_TORRENT_FILE, async () => {
      return this.getFilesByTorrentFile();
    });

    ipcMain.handle(
      IPC_CHANNEL.START_DOWNLOAD,
      (
        _,
        torrentList: {
          magnetURI: string;
          selectFiles: string[];
        }[],
        options: { downloadPath?: string },
      ) => {
        return this.startDownload(torrentList, options);
      },
    );

    ipcMain.handle(IPC_CHANNEL.GET_DOWNLOADING_TASKS, () => {
      return this.getDownloadingTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_DONE_TASKS, () => {
      return this.getDoneTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_PAUSED_TASKS, () => {
      return this.getPausedTasks();
    });

    ipcMain.handle(IPC_CHANNEL.PAUSE_TORRENT, (_, magnetURI: string) => {
      this.pauseTorrent(magnetURI);
    });

    ipcMain.handle(IPC_CHANNEL.RESUME_TORRENT, (_, magnetURI: string) => {
      this.resumeTorrent(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.DELETE_TORRENT, (_, magnetURI: string) => {
      this.deleteTorrent(magnetURI);
    });
  }

  async getFilesByUrl(magnetURI: string): Promise<GetFilesByUrlRes> {
    const { files, torrent } = await getTorrentFiles(this.instance, magnetURI);
    console.log(files);
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

  pauseTorrent(magnetURI: string) {
    const t = this.instance.get(magnetURI);
    if (t) {
      t.pause();
      this.downloadingTasks = this.downloadingTasks.filter((item) => item.magnetURI !== magnetURI);
      this.pausedTasks.push(t);
    }
  }

  resumeTorrent(magnetURI: string) {
    const t = this.instance.get(magnetURI);
    if (t) {
      t.resume();
      this.pausedTasks = this.pausedTasks.filter((item) => item.magnetURI !== magnetURI);
      this.downloadingTasks.push(t);
    }
  }

  deleteTorrent(magnetURI: string) {
    const t = this.instance.get(magnetURI);
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
