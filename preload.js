const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mouse', {
  in: () => ipcRenderer.invoke('mouseIn'),
  out: () => ipcRenderer.invoke('mouseOut'),
})