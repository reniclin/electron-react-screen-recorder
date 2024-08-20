// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log('preload.ts');

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title: string) => ipcRenderer.invoke('set-title', title),
  saveVideoBuffer: (arrayBuffer: ArrayBuffer) => ipcRenderer.invoke('save-video-buffer', arrayBuffer),
  getVideoSources: ()  => ipcRenderer.invoke('get-video-sources'),
});