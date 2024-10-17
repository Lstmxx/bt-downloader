import { DOWNLOAD_IPC_CHANNEL, SYSTEM_IPC_CHANNEL } from "@shared/ipc";
import { ipcMain } from "electron";
import { Downloader } from "../Downloader";
import { GetFilesByUrlRes } from "@shared/type";
import { taskInfoToTaskModel, torrentToTaskInfo } from "../../utils/transformer";
import taskRepository from "../db/Task";

export class DownloaderService {
  downloaderInstance!: Downloader;
  win: Electron.BrowserWindow;

  constructor(downloaderInstance: Downloader, win: Electron.BrowserWindow) {
    this.downloaderInstance = downloaderInstance;
    this.win = win;
    this.initListeners();
    this.initData();
  }

  initListeners() {
    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.GET_FILES_BY_URL, async (_, magnetURI: string): Promise<GetFilesByUrlRes> => {
      return this.downloaderInstance.getFilesByUrl(magnetURI);
    });
    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.GET_FILES_BY_TORRENT_FILE, async () => {
      return this.downloaderInstance.getFilesByTorrentFile();
    });

    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.GET_DONE_TASKS, async () => {
      const tasks = await taskRepository.getDoneTasks();
      return tasks;
    });

    ipcMain.handle(
      DOWNLOAD_IPC_CHANNEL.START_DOWNLOAD,
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

        return result.map(torrentToTaskInfo);
      },
    );

    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.GET_IN_PROGRESS_TASKS, () => {
      return this.downloaderInstance.getInProgressTasks();
    });

    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.PAUSE_TORRENT, async (_, id: string) => {
      const t = await this.downloaderInstance.pauseTorrent(id);
      if (t) {
        taskRepository.update([taskInfoToTaskModel(torrentToTaskInfo(t))]);
      }
    });

    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.RESUME_TORRENT, async (_, id: string) => {
      const t = await this.downloaderInstance.resumeTorrent(id);
      if (t) {
        taskRepository.update([taskInfoToTaskModel(torrentToTaskInfo(t))]);
      }
    });
    ipcMain.handle(DOWNLOAD_IPC_CHANNEL.DELETE_TORRENT, async (_, id: string) => {
      const result = await this.downloaderInstance.deleteTorrent(id);
      if (result) {
        taskRepository.deleteTask(id);
      }
    });
  }

  async initData() {
    try {
      const tasks = await taskRepository.getInProgressTasks();
      await this.downloaderInstance.addTorrentsFromTaskModel(tasks);
    } catch (error) {
      console.log(error);
    } finally {
      this.win.webContents.send(SYSTEM_IPC_CHANNEL.READY);
    }
  }

  close() {
    this.downloaderInstance.destroy();

    const taskModels = this.downloaderInstance.inProgressTasks.map((item) =>
      taskInfoToTaskModel(torrentToTaskInfo(item)),
    );
    taskRepository.update(taskModels);
  }
}
