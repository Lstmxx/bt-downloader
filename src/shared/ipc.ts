export const IPC_CHANNEL = {
  GET_FILES_BY_URL: "downloader:get-files-by-url",
  GET_DOWNLOADING_TASKS: "downloader:get-downloading-tasks",
  START_DOWNLOAD: "downloader:start-download",
  TORRENT_DONE: "downloader:torrent-done",
  GET_DONE_TASKS: "downloader:get-done-tasks",
  PAUSE_TORRENT: "downloader:pause-torrent",
  RESUME_TORRENT: "downloader:resume-torrent",
  GET_FILES_BY_TORRENT_FILE: "downloader:get-files-by-torrent-file",
  GET_PAUSED_TASKS: "downloader:get-paused-tasks",
  DELETE_TORRENT: "downloader:delete-torrent",
  GET_IN_PROGRESS_TASKS: "downloader:get-in-progress-tasks",
};

export const DB_IPC_CHANNEL = {
  CREATE_TASK: "db:create-task",
};

export const IPC_DIALOG_CHANNEL = {
  GET_DICT_PATH: "dialog:get-dict-path",
};

export const IPC_CONFIG_CHANNEL = {
  GET_CONFIG: "config:get",
  SET_CONFIG: "config:set",
};
