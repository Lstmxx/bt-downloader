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

    ipcMain.handle(IPC_CHANNEL.GET_DONE_TASKS, async () => {
      const tasks = await taskRepository.getDoneTasks();
      return tasks;
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

        return result.map(torrentToTaskInfo);
      },
    );

    ipcMain.handle(IPC_CHANNEL.GET_IN_PROGRESS_TASKS, () => {
      return this.downloaderInstance.getInProgressTasks();
    });

    ipcMain.handle(IPC_CHANNEL.PAUSE_TORRENT, (_, id: string) => {
      this.downloaderInstance.pauseTorrent(id);
    });

    ipcMain.handle(IPC_CHANNEL.RESUME_TORRENT, (_, id: string) => {
      this.downloaderInstance.resumeTorrent(id);
    });
    ipcMain.handle(IPC_CHANNEL.DELETE_TORRENT, (_, id: string) => {
      this.downloaderInstance.deleteTorrent(id);
    });
  }

  async initData() {
    const tasks = await taskRepository.getInProgressTasks();
    console.log("initData", tasks);
    const taskInfos = tasks.map((item) => {
      return {
        magnetURI: item.magnetURI,
        selectFiles: (item.files || []).map((file) => file.name),
        path: item.path,
      };
    });
    const result = await this.downloaderInstance.addTorrents(taskInfos);
    console.log("result", result);
    result.forEach((item, index) => {
      item.id = tasks[index].id;
      console.log("item.id", item.id);
    });
  }

  close() {
    this.downloaderInstance.destroy();

    const taskModels = this.downloaderInstance.inProgressTasks.map((item) =>
      taskInfoToTaskModel(torrentToTaskInfo(item)),
    );
    taskRepository.update(taskModels);
  }
}
