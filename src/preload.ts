// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log('preload.ts');

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveVideoBuffer: (arrayBuffer: ArrayBuffer) => ipcRenderer.invoke('save-video-buffer', arrayBuffer),
});