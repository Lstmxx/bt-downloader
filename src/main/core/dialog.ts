import { IPC_DIALOG_CHANNEL } from "@shared/ipc";
import { dialog, ipcMain, OpenDialogOptions } from "electron";

const getPathDialog = async (_, defaultPath: string) => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath,
  });

  return filePaths;
};

export const getFileDialog = async (filters: Electron.FileFilter[], multi = false) => {
  const properties: OpenDialogOptions["properties"] = multi ? ["openFile", "multiSelections"] : ["openFile"];

  const { filePaths } = await dialog.showOpenDialog({
    properties,
    filters,
  });

  return filePaths;
};

export const initDialog = () => {
  ipcMain.handle(IPC_DIALOG_CHANNEL.GET_DICT_PATH, getPathDialog);
};
