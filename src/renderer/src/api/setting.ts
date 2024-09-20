import { IPC_CONFIG_CHANNEL } from "@shared/ipc";
import { SettingConfig } from "@shared/type";

export const getConfig = async () => {
  const config = (await window.ipcRenderer.invoke(IPC_CONFIG_CHANNEL.GET_CONFIG)) as SettingConfig;
  return config;
};
