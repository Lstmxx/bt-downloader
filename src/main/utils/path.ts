import { app } from "electron";

export const getUserDataPath = () => {
  return app.getPath("userData");
};

export const getDownloadPath = () => {
  return app.getPath("downloads");
};

export const getConfigBasePath = () => {
  const path = getUserDataPath();
  return path;
};
