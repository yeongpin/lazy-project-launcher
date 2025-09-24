const { ipcMain, BrowserWindow } = require('electron')

class WindowManager {
  constructor() {
    this.windows = new Map()
  }

  setupIPC() {
    // Handle window minimize
    ipcMain.handle('window-minimize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        window.minimize()
        return true
      }
      return false
    })

    // Handle window maximize/restore
    ipcMain.handle('window-maximize', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        if (window.isMaximized()) {
          window.unmaximize()
        } else {
          window.maximize()
        }
        return true
      }
      return false
    })

    // Handle window close
    ipcMain.handle('window-close', (event) => {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        window.close()
        return true
      }
      return false
    })

    // Handle custom messages - remove this handler, let main.js handle it
    // ipcMain.handle('send-message', (event, message) => {
    //   console.log('Message from renderer:', message)
    //   return `Echo: ${message}`
    // })
  }

  createWindow(options = {}) {
    const defaultOptions = {
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: require('path').join(__dirname, 'preload.js')
      }
    }

    const windowOptions = { ...defaultOptions, ...options }
    const window = new BrowserWindow(windowOptions)

    const windowId = Date.now().toString()
    this.windows.set(windowId, window)

    window.on('closed', () => {
      this.windows.delete(windowId)
    })

    return { window, windowId }
  }

  getWindow(windowId) {
    return this.windows.get(windowId)
  }

  getAllWindows() {
    return Array.from(this.windows.values())
  }

  closeWindow(windowId) {
    const window = this.windows.get(windowId)
    if (window) {
      window.close()
      this.windows.delete(windowId)
      return true
    }
    return false
  }
}

module.exports = WindowManager
