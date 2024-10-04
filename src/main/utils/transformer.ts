import { TaskInfo, TorrentFile } from "@shared/type";
import type Webtorrent from "webtorrent";

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
    paused: torrent.paused,
    done: torrent.done,
  };
};
