import Webtorrent from "webtorrent";
import { ipcMain } from "electron";

import { IPC_CHANNEL } from "@shared/ipc";
import { TaskInfo, GetFilesByUrlRes } from "@shared/type";
import { torrentFileToFile, torrentToTaskInfo } from "../utils/transformer";

// const torrentProgress = () => {};

const getTorrentFiles = async (instance: Webtorrent.Instance, torrentUrl: string) => {
  return new Promise<{ files: Webtorrent.TorrentFile[]; torrent: Webtorrent.Torrent }>((resolve, reject) => {
    // const t = instance.get(torrentUrl);
    // if (t) {
    //   if (t.files) {
    //     resolve({ files: t.files, torrent: t });
    //     return;
    //   }
    //   instance.remove(torrentUrl, {}, (err) => {
    //     console.log('remove:', err);
    //     reject(err);
    //   });
    // }

    console.log("add:", torrentUrl);

    instance.add(torrentUrl, function (torrent) {
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
  instance: Webtorrent.Instance;
  win: Electron.BrowserWindow;

  downloadingTasks: Webtorrent.Torrent[] = [];
  doneTasks: TaskInfo[] = [];

  constructor(win: Electron.BrowserWindow) {
    this.win = win;
    this.instance = new Webtorrent({
      tracker: {
        announce: [],
      },
    });
    this.initListeners();
  }

  initListeners() {
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_URL, async (_, torrentUrl: string): Promise<GetFilesByUrlRes> => {
      return this.getFilesByUrl(torrentUrl);
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
  }

  async getFilesByUrl(torrentUrl: string): Promise<GetFilesByUrlRes> {
    const { files, torrent } = await getTorrentFiles(this.instance, torrentUrl);
    console.log(files);
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
        this.selectFilesInTorrent(t, item.selectFiles);
        t.resume();
      } else {
        t = this.instance.add(item.magnetURI, { path: options.downloadPath }, (torrent) => {
          this.selectFilesInTorrent(torrent, item.selectFiles);
          torrent.on("done", () => {
            this.handleTorrentDone(torrent);
          });
        });
      }

      result.push(torrentToTaskInfo(t));
      this.downloadingTasks.push(t);
    });

    return result;
  }

  destroy() {
    this.instance.destroy();
  }
}
