// Config //
const DEV_TOOLS_ENABLED = false;

// Code //
const { app, BrowserWindow, screen, ipcMain, protocol, net } = require('electron');
const path = require("path");
const url = require('url');
const fs = require("fs").promises;

const notches = [];

const defaultScales = {
    "notch": [0.11, 0.03],
    "handle": [0.11, 0.01],
};

const scales = {
    "setup": [0.2, 0.2],
    "expanded": [0.25, 0.06]
};

const createWindow = (display) => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        transparent: true,
        frame: false,
        resizable: false,
        maximizable: false,
        alwaysOnTop: true,
        enableLargerThanScreen: true,
        roundedCorners: false,
    });

    win.loadFile('public/index.html');
    if (DEV_TOOLS_ENABLED) {
        win.webContents.openDevTools({
            mode: "detach",
        });
    }

    function setScale(scale) {
        let [scaleWidth, scaleHeight] = scale || (display.internal ? defaultScales.notch : defaultScales.handle);

        const displayBounds = display.bounds;
        const width = Math.round(displayBounds.width * scaleWidth);
        const height = Math.round(displayBounds.height * scaleHeight);

        win.setBounds({
            width,
            height,
            x: displayBounds.x + (displayBounds.width - width) / 2,
            y: 0,
        }, true);
    }

    setScale();
    win.setAlwaysOnTop(true, 'screen-saver', 10000);
    win.show();

    notches.push([display, win, setScale]);
};

async function registerIPCCallbacks() {
    ipcMain.handle('setSizeState', (event, state) => {
        const windowToTween = BrowserWindow.fromWebContents(event.sender);
        notches.forEach(([, win, setScale]) => {
            if (windowToTween === win) {
                setScale(scales[state] || undefined);
            }
        });
    });
}

app.whenReady().then(async () => {
    await registerIPCCallbacks();

    const allDisplays = screen.getAllDisplays();
    allDisplays.forEach(createWindow);
});

app.on('window-all-closed', () => {
    app.quit();
});