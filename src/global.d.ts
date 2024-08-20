export interface IElectronAPI {
  setTitle: (title: string) => Promise<void>,
  saveVideoBuffer: (arrayBuffer: ArrayBuffer) => Promise<void>,
  getVideoSources: () => Promise<Electron.DesktopCapturerSource[]>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}