import { IPC_DIALOG_CHANNEL } from "@shared/ipc";
import { dialog, ipcMain } from "electron";

const getPathDialog = async (_, defaultPath: string) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath,
  });

  return filePaths;
};

export const initDialog = () => {
  ipcMain.handle(IPC_DIALOG_CHANNEL.GET_DICT_PATH, getPathDialog);
};
