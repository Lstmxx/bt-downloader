import { TaskInfo, TorrentFile } from "@shared/type";
import type Webtorrent from "webtorrent";
import { FileModel, TaskModel } from "../core/db/model";
import { TASK_STATUS } from "@shared/enum";

export const torrentFileToFile = (files: Webtorrent.TorrentFile[]): TorrentFile[] => {
  const result: TorrentFile[] = files.map((file) => {
    return {
      name: file.name,
      length: file.length,
      progress: file.progress,
      path: file.path,
      downloaded: file.downloaded,
    };
  });
  return result;
};

export const torrentPieceToPiece = (pieces: Array<Webtorrent.TorrentPiece | null>) => {
  if (!pieces) return [];
  const result = (pieces || []).map((piece) => {
    return {
      length: piece?.length || 0,
      missing: piece?.missing || 0,
    };
  });
  return result;
};

export const torrentToTaskInfo = (torrent: Webtorrent.Torrent): TaskInfo => {
  return {
    infoHash: torrent.infoHash,
    magnetURI: torrent.magnetURI,
    files: torrentFileToFile(torrent.files),
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    progress: torrent.progress,
    length: torrent.length,
    name: torrent.name,
    createTime: torrent.created,
    maxWebConns: torrent.maxWebConns,
    path: torrent.path,
    status: torrent.paused ? TASK_STATUS.PAUSED : torrent.done ? TASK_STATUS.DONE : TASK_STATUS.DOWNLOADING,
    downloaded: torrent.downloaded,
  };
};

export const torrentFileToFileModel = (file: TorrentFile) => {
  const fileModel = new FileModel();
  fileModel.downloaded = file.downloaded;
  fileModel.length = file.length;
  fileModel.name = file.name;
  fileModel.path = file.path;
  return fileModel;
};

export const taskInfoToTaskModel = (taskInfo: TaskInfo) => {
  const taskModel = new TaskModel();

  taskModel.createTime = taskInfo.createTime;
  if (taskInfo.id) {
    taskModel.id = taskInfo.id;
  }
  taskModel.infoHash = taskInfo.infoHash;

  taskModel.magnetURI = taskInfo.magnetURI;
  taskModel.name = taskInfo.name;
  taskModel.path = taskInfo.path;
  taskModel.progress = taskInfo.progress;
  taskModel.status = taskInfo.status;

  taskModel.downloaded = taskInfo.downloaded;
  taskModel.length = taskInfo.length;
  taskModel.files = taskInfo.files.map(torrentFileToFileModel);
  return taskModel;
};
