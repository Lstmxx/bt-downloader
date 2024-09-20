export const IPC_CHANNEL = {  
  GET_FILES_BY_URL: 'downloader:get-files-by-url',
  GET_DOWNLOADING_TASKS: 'downloader:get-downloading-tasks',
  START_DOWNLOAD: 'downloader:start-download',
  TORRENT_DONE: 'downloader:torrent-done',
  GET_DONE_TASKS: 'downloader:get-done-tasks',
};

export const IPC_DIALOG_CHANNEL = {
  GET_DICT_PATH: 'dialog:get-dict-path',
};

export const IPC_CONFIG_CHANNEL = {
  GET_CONFIG: 'config:get',
  SET_CONFIG: 'config:set'
};
