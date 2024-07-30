const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sizeState', {
  set: (state) => ipcRenderer.invoke('setSizeState', state),
})