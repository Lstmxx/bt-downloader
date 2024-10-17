import { IPC_CHANNEL } from "@shared/ipc";
import { ipcMain } from "electron";
import { Downloader } from "../Downloader";
import { GetFilesByUrlRes } from "@shared/type";
import { taskInfoToTaskModel, torrentToTaskInfo } from "../../utils/transformer";
import taskRepository from "../db/Task";

export class DownloaderService {
  downloaderInstance!: Downloader;

  constructor(win: Electron.BrowserWindow) {
    this.initListeners();
    this.downloaderInstance = new Downloader(win);
    this.initData();
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
      async (
        _,
        torrentList: {
          magnetURI: string;
          selectFiles: string[];
        }[],
        options: { downloadPath?: string },
      ) => {
        const result = await this.downloaderInstance.startDownload(torrentList, options);
        console.log("startDownload", result);
        const taskModels = result.map((item) => taskInfoToTaskModel(torrentToTaskInfo(item)));
        const databaseResult = await taskRepository.create(taskModels);

        // 给torrent设置id
        result.forEach((item, index) => {
          item.id = databaseResult[index].id;
        });
        console.log("databaseResult", databaseResult);

        return result;
      },
    );

    ipcMain.handle(IPC_CHANNEL.GET_IN_PROGRESS_TASKS, () => {
      return this.downloaderInstance.getInProgressTasks();
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

  async initData() {
    const { count, list } = await taskRepository.getList({ pageNum: 1, pageSize: 100, sort: 2 });
    console.log(count, list);
  }

  close() {
    this.downloaderInstance.destroy();
  }
}
