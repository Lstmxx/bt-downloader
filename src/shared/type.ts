// 定义 File 类型
export interface TorrentFile {
  name: string;
  length: number;
  progress: number;
  path: string;
  downloaded: number;
}

export interface SettingConfig {
  downloadPath: string;
}

interface TorrentPiece {
  length: number;

  missing: number;
}

export interface TaskInfo {
  infoHash: string;

  magnetURI: string;

  torrentFileBlobURL: string;

  files: TorrentFile[];

  announce: string[];

  ["announce-list"]: string[][];

  pieces: Array<TorrentPiece | null>;

  timeRemaining: number;

  received: number;

  downloaded: number;

  uploaded: number;

  downloadSpeed: number;

  uploadSpeed: number;

  progress: number;

  ratio: number;

  length: number;

  pieceLength: number;

  lastPieceLength: number;

  numPeers: number;

  path: string;

  ready: boolean;

  paused: boolean;

  done: boolean;

  name: string;

  created: Date;

  createdBy: string;

  comment: string;

  maxWebConns: number;
}

export interface GetFilesByUrlRes {
  files: TorrentFile[];
  magnetURI: string;
};