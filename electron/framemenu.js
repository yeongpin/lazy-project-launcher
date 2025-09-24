const { Menu, dialog } = require('electron')
const path = require('path')

class FrameMenu {
    constructor(mainWindow) {
        this.mainWindow = mainWindow
    }

    createMenu() {
        console.log('Creating menu...')
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Import Project',
                        accelerator: 'CmdOrCtrl+I',
                        click: () => {
                            this.importProject()
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Exit',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            if (this.mainWindow) {
                                this.mainWindow.close()
                            }
                        }
                    }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Minimize',
                        accelerator: 'CmdOrCtrl+M',
                        click: () => {
                            if (this.mainWindow) {
                                this.mainWindow.minimize()
                            }
                        }
                    },
                    {
                        label: 'Maximize',
                        accelerator: 'F11',
                        enabled: false,
                        click: () => {
                            if (this.mainWindow) {
                                if (this.mainWindow.isMaximized()) {
                                    this.mainWindow.unmaximize()
                                } else {
                                    this.mainWindow.maximize()
                                }
                            }
                        }
                    },
                    {
                        label: 'Close',
                        accelerator: 'CmdOrCtrl+W',
                        click: () => {
                            if (this.mainWindow) {
                                this.mainWindow.close()
                            }
                        }
                    }
                ]
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: () => {
                            console.log('About this app')
                        }
                    },
                    {
                        label: 'Developer Tools',
                        accelerator: 'F12',
                        click: () => {
                            if (this.mainWindow) {
                                this.mainWindow.webContents.toggleDevTools()
                            }
                        }
                    }
                ]
            }
        ]

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
        console.log('Menu created successfully')
    }

    async importProject() {
        try {
            const result = await dialog.showOpenDialog(this.mainWindow, {
                title: 'Select Project Folder',
                properties: ['openDirectory'],
                buttonLabel: 'Import Project'
            })

            if (!result.canceled && result.filePaths.length > 0) {
                const projectPath = result.filePaths[0]
                const projectName = path.basename(projectPath)

                // send project information to renderer process
                this.mainWindow.webContents.send('project-imported', {
                    name: projectName,
                    path: projectPath,
                    id: Date.now().toString()
                })
            }
        } catch (error) {
            console.error('Error importing project:', error)
        }
    }

    updateMainWindow(mainWindow) {
        this.mainWindow = mainWindow
    }

    // static method, used to trigger import project from outside
    static async triggerImportProject(mainWindow) {
        const frameMenu = new FrameMenu(mainWindow)
        await frameMenu.importProject()
    }
}

module.exports = FrameMenu
