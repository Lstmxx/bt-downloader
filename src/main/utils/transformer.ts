import { TaskInfo } from "@shared/type";
import type Webtorrent from "webtorrent";

export const torrentFileToFile = (files: Webtorrent.TorrentFile[]) => {
  const result = files.map((file) => {
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

const torrentPieceToPiece = (pieces: Array<Webtorrent.TorrentPiece | null>) => {
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
    torrentFileBlobURL: torrent.torrentFileBlobURL,
    files: torrentFileToFile(torrent.files),
    announce: torrent.announce,
    ["announce-list"]: torrent["announce-list"],
    pieces: torrentPieceToPiece(torrent.pieces),
    timeRemaining: torrent.timeRemaining,
    received: torrent.received,
    downloaded: torrent.downloaded,
    uploaded: torrent.uploaded,
    downloadSpeed: torrent.downloadSpeed,
    uploadSpeed: torrent.uploadSpeed,
    progress: torrent.progress,
    ratio: torrent.ratio,
    length: torrent.length,
    pieceLength: torrent.pieceLength,
    lastPieceLength: torrent.lastPieceLength,
    numPeers: torrent.numPeers,
    name: torrent.name,
    created: torrent.created,
    createdBy: torrent.createdBy,
    comment: torrent.comment,
    maxWebConns: torrent.maxWebConns,
    path: torrent.path,
    ready: torrent.ready,
    paused: torrent.paused,
    done: torrent.done,
  };
};
