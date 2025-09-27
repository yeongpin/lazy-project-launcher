const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const FrameMenu = require('./framemenu')
const WindowManager = require('./windowmanager')

const isDev = process.env.NODE_ENV === 'development'

// disable GPU hardware acceleration to solve GPU process crash problem
app.disableHardwareAcceleration()

let mainWindow
let frameMenu
let windowManager
let runningProjects = new Map() // store running project processes

// set IPC handlers
function setupIPC() {
    // handle import project request
    ipcMain.handle('send-message', async (event, message, data) => {
        if (message === 'import-project') {
            try {
                // get current window
                const currentWindow = BrowserWindow.fromWebContents(event.sender)
                if (currentWindow) {
                    await FrameMenu.triggerImportProject(currentWindow)
                    return { success: true }
                } else {
                    return { success: false, error: 'No window found' }
                }
            } catch (error) {
                console.error('Error triggering import project:', error)
                return { success: false, error: error.message }
            }
        }

        if (message === 'open-terminal') {
            try {
                const { exec } = require('child_process')
                const projectPath = data?.path || process.cwd()

                console.log('Opening terminal in:', projectPath)

                // select terminal command based on operating system
                if (process.platform === 'win32') {
                    // use cmd command to open PowerShell
                    const command = `start powershell -NoExit -Command "cd '${projectPath}'"`
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error('PowerShell error:', error)
                            // if PowerShell fails, try CMD
                            exec(`start cmd /k "cd /d ${projectPath}"`, (cmdError) => {
                                if (cmdError) {
                                    console.error('CMD error:', cmdError)
                                } else {
                                    console.log('Opened CMD as fallback')
                                }
                            })
                        } else {
                            console.log('Opened PowerShell successfully')
                        }
                    })
                } else if (process.platform === 'darwin') {
                    exec(`open -a Terminal "${projectPath}"`, (error) => {
                        if (error) {
                            console.error('Terminal error:', error)
                        } else {
                            console.log('Opened Terminal successfully')
                        }
                    })
                } else {
                    exec(`gnome-terminal --working-directory="${projectPath}"`, (error) => {
                        if (error) {
                            console.error('gnome-terminal error:', error)
                        } else {
                            console.log('Opened gnome-terminal successfully')
                        }
                    })
                }

                return { success: true }
            } catch (error) {
                console.error('Error opening terminal:', error)
                return { success: false, error: error.message }
            }
        }

        if (message === 'start-project') {
            try {
                const { spawn } = require('child_process')
                const { path: projectPath, commands, projectId } = data

                console.log('Starting project:', projectId, 'in:', projectPath, 'with commands:', commands)

                // if project is already running, stop it first
                if (runningProjects.has(projectId)) {
                    const existingProcess = runningProjects.get(projectId)
                    existingProcess.kill()
                    runningProjects.delete(projectId)
                }

                // select execution method based on operating system
                let childProcess
                if (process.platform === 'win32') {
                    // Windows: use cmd to execute command, show terminal window
                    childProcess = spawn('cmd', ['/k', commands], {
                        cwd: projectPath,
                        shell: true,
                        detached: true, // detach process, let terminal window exist independently
                        stdio: 'pipe',
                        windowsHide: false // show window
                    })
                } else {
                    // Unix-like: use shell to execute command
                    childProcess = spawn('sh', ['-c', commands], {
                        cwd: projectPath,
                        detached: true, // detach process
                        stdio: 'pipe'
                    })
                }

                // store process reference and related information
                runningProjects.set(projectId, {
                    process: childProcess,
                    path: projectPath,
                    commands: commands,
                    startTime: Date.now()
                })

                // handle process output
                childProcess.stdout.on('data', (data) => {
                    console.log(`Project ${projectId} stdout:`, data.toString())
                })

                childProcess.stderr.on('data', (data) => {
                    console.error(`Project ${projectId} stderr:`, data.toString())
                })

                childProcess.on('close', (code) => {
                    console.log(`Project ${projectId} process exited with code ${code}`)
                    runningProjects.delete(projectId)
                })

                childProcess.on('error', (error) => {
                    console.error(`Project ${projectId} process error:`, error)
                    runningProjects.delete(projectId)
                })

                return { success: true, processId: childProcess.pid }
            } catch (error) {
                console.error('Error starting project:', error)
                return { success: false, error: error.message }
            }
        }

        if (message === 'stop-project') {
            try {
                const { projectId } = data

                console.log('Stopping project:', projectId)

                if (runningProjects.has(projectId)) {
                    const projectInfo = runningProjects.get(projectId)
                    const childProcess = projectInfo.process

                    // since the process is detached, the user can directly close the terminal window
                    // here we just remove it from our tracking
                    runningProjects.delete(projectId)
                    console.log('Project removed from tracking (user can close terminal window)')
                    return { success: true }
                } else {
                    console.log('Project not running')
                    return { success: true, message: 'Project not running' }
                }
            } catch (error) {
                console.error('Error stopping project:', error)
                return { success: false, error: error.message }
            }
        }

        return { success: false, message: 'Unknown message' }
    })
}

function createWindow() {
    // initialize window manager
    windowManager = new WindowManager()
    windowManager.setupIPC()

    // Read version from package.json
    const packageInfo = require('../package.json')
    const appTitle = `Lazy Project Launcher v${packageInfo.version}`

    // use WindowManager to create window
    const windowOptions = {
        title: appTitle,
        icon: path.join(__dirname, '../icon.png'),
        width: 400,
        height: 600,
        minWidth: 400,
        minHeight: 600,
        maxWidth: 1000,
        maxHeight: 800,
        resizable: false,
        // Enable dark theme for window frame
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        frame: true,
        backgroundColor: '#1e293b', // dark background for window frame
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            // add additional GPU related settings
            webgl: false,
            offscreen: false
        }
    }

    const { window } = windowManager.createWindow(windowOptions)
    mainWindow = window
    
    // Explicitly set the window title after creation
    mainWindow.setTitle(appTitle)

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:12511')
        // open developer tools in a new window, detach mode
        mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
        // in production environment, use absolute path to load file
        const indexPath = path.join(__dirname, '../dist/index.html')
        mainWindow.loadFile(indexPath)
    }
    
    // Ensure title is set after page load
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.setTitle(appTitle)
    })

    // initialize menu and update main window reference
    console.log('Creating frame menu...')
    frameMenu = new FrameMenu(mainWindow)
    frameMenu.createMenu()
    console.log('Frame menu created')
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    // Set initial native theme
    const { nativeTheme } = require('electron')
    
    // Force dark theme for the entire app on Windows
    if (process.platform === 'win32') {
        try {
            console.log('Setting Windows to dark theme...')
            nativeTheme.themeSource = 'dark'
        } catch (error) {
            console.log('Could not set native theme to dark:', error.message)
        }
    } else {
        nativeTheme.themeSource = 'system' // Start with system theme for other platforms
    }
    
    setupIPC()
    createWindow()
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
