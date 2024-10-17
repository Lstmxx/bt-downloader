import { TaskInfo, TorrentFile } from "@shared/type";
import type Webtorrent from "webtorrent";
import { FileModel, TaskModel } from "../core/db/model";
import { TASK_STATUS } from "@shared/enum";

import { nanoid } from "nanoid";

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
    id: torrent.id,
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
  fileModel.id = file.id || nanoid();
  fileModel.downloaded = file.downloaded;
  fileModel.length = file.length;
  fileModel.name = file.name;
  fileModel.path = file.path;
  fileModel.progress = file.progress;
  return fileModel;
};

export const taskInfoToTaskModel = (taskInfo: TaskInfo) => {
  const taskModel = new TaskModel();

  taskModel.createTime = taskInfo.createTime;

  taskModel.id = taskInfo.id || nanoid();

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

export const fileModelToFile = (fileModel: FileModel): TorrentFile => {
  return {
    name: fileModel.name,
    length: fileModel.length,
    progress: fileModel.progress,
    path: fileModel.path,
    downloaded: fileModel.downloaded,
  };
};

export const taskModelToTaskInfo = (taskModel: TaskModel): TaskInfo => {
  return {
    id: taskModel.id,
    infoHash: taskModel.infoHash,
    magnetURI: taskModel.magnetURI,
    files: (taskModel.files || []).map(fileModelToFile),
    downloadSpeed: 0,
    uploadSpeed: 0,
    progress: taskModel.progress,
    length: taskModel.length,
    name: taskModel.name,
    createTime: taskModel.createTime,
    maxWebConns: 0,
    path: taskModel.path,
    status: taskModel.status as TASK_STATUS,
    downloaded: taskModel.downloaded,
  };
};
