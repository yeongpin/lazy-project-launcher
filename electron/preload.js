const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example API methods
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,

  // IPC communication example
  sendMessage: (message, data) => ipcRenderer.invoke('send-message', message, data),

  // Window management
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),

  // Project management
  onProjectImported: (callback) => ipcRenderer.on('project-imported', callback),
  removeProjectImportedListener: (callback) => ipcRenderer.removeListener('project-imported', callback),

  // Theme management
  onThemeChanged: (callback) => ipcRenderer.on('theme-changed', callback),
  removeThemeChangedListener: (callback) => ipcRenderer.removeListener('theme-changed', callback),

  // Locale management
  onLocaleChanged: (callback) => ipcRenderer.on('locale-changed', callback),
  removeLocaleChangedListener: (callback) => ipcRenderer.removeListener('locale-changed', callback)
})
