import { IPC_CHANNEL } from "@shared/ipc";
import { ipcMain } from "electron";
import { Downloader } from "../Downloader";
import { GetFilesByUrlRes } from "@shared/type";

export class DownloaderService {
  downloaderInstance!: Downloader;

  constructor(win: Electron.BrowserWindow) {
    this.initListeners();
    this.downloaderInstance = new Downloader(win);
  }

  initListeners() {
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_URL, async (_, magnetURI: string): Promise<GetFilesByUrlRes> => {
      return this.downloaderInstance.getFilesByUrl(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.GET_FILES_BY_TORRENT_FILE, async () => {
      return this.downloaderInstance.getFilesByTorrentFile();
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
        return this.downloaderInstance.startDownload(torrentList, options);
      },
    );

    ipcMain.handle(IPC_CHANNEL.GET_DOWNLOADING_TASKS, () => {
      return this.downloaderInstance.getDownloadingTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_DONE_TASKS, () => {
      return this.downloaderInstance.getDoneTasks();
    });
    ipcMain.handle(IPC_CHANNEL.GET_PAUSED_TASKS, () => {
      return this.downloaderInstance.getPausedTasks();
    });

    ipcMain.handle(IPC_CHANNEL.PAUSE_TORRENT, (_, magnetURI: string) => {
      this.downloaderInstance.pauseTorrent(magnetURI);
    });

    ipcMain.handle(IPC_CHANNEL.RESUME_TORRENT, (_, magnetURI: string) => {
      this.downloaderInstance.resumeTorrent(magnetURI);
    });
    ipcMain.handle(IPC_CHANNEL.DELETE_TORRENT, (_, magnetURI: string) => {
      this.downloaderInstance.deleteTorrent(magnetURI);
    });
  }

  close() {
    this.downloaderInstance.destroy();
  }
}
