import WebTorrent from "webtorrent";
import { TASK_STATUS } from "./enum";

export interface SettingConfig {
  clientOptions: WebTorrent.Options;
  downloadPath: string;
}

// 定义 File 类型
export interface TorrentFile {
  id?: number;
  name: string;
  length: number;
  progress: number;
  path: string;
  downloaded: number;
  task?: TaskInfo;
}

export interface TorrentPiece {
  length: number;

  missing: number;
}

export interface TaskInfo {
  // database id
  id?: number;

  infoHash: string;

  magnetURI: string;

  files: TorrentFile[];

  // pieces: Array<TorrentPiece>;

  // timeRemaining: number;

  // received: number;

  downloaded: number;

  // uploaded: number;

  downloadSpeed: number;

  uploadSpeed: number;

  progress: number;

  // ratio: number;

  length: number;

  // pieceLength: number;

  // lastPieceLength: number;

  // numPeers: number;

  path: string;

  // ready: boolean;

  status: TASK_STATUS;

  name: string;

  createTime: Date;

  maxWebConns: number;
}

export interface GetFilesByUrlRes {
  files: TorrentFile[];
  magnetURI: string;
}

export interface GetFilesByTorrentFileRes {
  files: TorrentFile[];
  magnetURI: string;
}
