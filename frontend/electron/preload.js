// Preload: expose a safe, minimal API to the renderer via contextBridge.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: () => ipcRenderer.invoke('app:loadData'),
  saveData: (data) => ipcRenderer.invoke('app:saveData', data),
  exportBackup: (json) => ipcRenderer.invoke('app:exportBackup', json),
  importBackup: () => ipcRenderer.invoke('app:importBackup'),
  dataPath: () => ipcRenderer.invoke('app:dataPath'),
});
