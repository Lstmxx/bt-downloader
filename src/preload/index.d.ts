import { ElectronAPI } from "@electron-toolkit/preload";

interface Api {
  onTorrentDone: (cb: (magnetURI: string) => void) => Electron.IpcRenderer;
  onSystemReady: (cb: () => void) => Electron.IpcRenderer;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
    ipcRenderer: import("electron").IpcRenderer;
  }
}
