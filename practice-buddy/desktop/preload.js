// AEEG Practice Buddy - Electron Preload Script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  clearLocalData: () => ipcRenderer.invoke('clear-local-data'),
  exitKiosk: () => ipcRenderer.send('exit-kiosk'),
  lockKiosk: () => ipcRenderer.send('lock-kiosk'),
  onLogout: (callback) => ipcRenderer.on('logout', callback),
});