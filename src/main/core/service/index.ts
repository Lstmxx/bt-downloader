import { db } from "../db";
import { DownloaderService } from "./Downloader";
import { TaskService } from "../db/Task";

let taskService: TaskService;
let downloaderService: DownloaderService;

export const initService = (win: Electron.BrowserWindow) => {
  console.log("Service initialized");
  taskService = new TaskService();
  downloaderService = new DownloaderService(win);
};

export const closeService = () => {
  console.log("Service closed");
  taskService.close();
  downloaderService.close();
  db.close();
};
