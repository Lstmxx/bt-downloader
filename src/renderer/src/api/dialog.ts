import { IPC_DIALOG_CHANNEL } from "@shared/ipc";

export const getDictPaths = async (defaultPath: string) => {
  const paths = (await window.ipcRenderer.invoke(IPC_DIALOG_CHANNEL.GET_DICT_PATH, defaultPath)) as string[];
  return paths;
};
