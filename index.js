// Config //
const DEV_TOOLS_ENABLED = true

// Code //
const { app, BrowserWindow, screen, ipcMain } = require('electron/main');
const path = require("node:path");

const notches = []

const defaultScales = {
    "notch": [ 0.11, 0.03 ],
    "handle": [ 0.11, 0.01 ],
}

const expandedScale = [ 0.25, 0.06 ]

const createWindow = (display) => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },

        transparent: true,
        borderless: true,
        show: false,
        frame: false,
        resizable: false,
        maximizable: false,
        alwaysOnTop: true,
        enableLargerThanScreen: true,
        roundedCorners: false,
    })

    win.loadFile('public/index.html')
    if (DEV_TOOLS_ENABLED) {
        win.webContents.openDevTools({
            "mode": "detach",
        })
    }

    function setScale(scale) {
        var scaleWidth, scaleHeight

        if (scale) {
            [ scaleWidth, scaleHeight ] = scale
        } else {
            if (display.internal) {
                [ scaleWidth, scaleHeight ] = defaultScales.notch
            } else {
                [ scaleWidth, scaleHeight ] = defaultScales.handle
            }
        }

        const displayBounds = display.bounds

        const width = Math.round(displayBounds.width * scaleWidth)
        const height = Math.round(displayBounds.height * scaleHeight)

        win.setBounds({
            "width": width,
            "height": height,

            "x": displayBounds.x - (width / 2) + (displayBounds.width / 2),
            "y": 0,
        }, true)
    }

    setScale()

    win.setAlwaysOnTop(true, 'screen-saver', 10000);
    win.show()

    notches.push([display, win, setScale])
}

async function registerIPCCallbacks() {
    ipcMain.handle('mouseIn', (event) => {
        const windowToTween = BrowserWindow.fromWebContents(event.sender);
        notches.forEach(async ([display, win, setScale]) => {
            if (windowToTween == win) {
                setScale(expandedScale)
            }
        })
    })

    ipcMain.handle('mouseOut', (event) => {
        const windowToTween = BrowserWindow.fromWebContents(event.sender);
        notches.forEach(async ([display, win, setScale]) => {
            if (windowToTween == win) {
                setScale()
            }
        })
    })
}

app.whenReady().then(() => {
    const allDisplays = screen.getAllDisplays()
    allDisplays.forEach((display) => {
        createWindow(display)
    });

    registerIPCCallbacks();
})

app.on('window-all-closed', () => {
    app.quit()
})