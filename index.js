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
    "setup": [0.2, 0.25],
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

function getMimeType(extension) {
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    return mimeTypes[extension] || 'application/octet-stream';
}

async function registerProtocol() {
    protocol.handle('dynnotch', async (request) => {
        try {
            const filePath = request.url.slice('dynnotch://'.length);
            const fullPath = path.join(__dirname, 'assets', filePath);
            const fileContent = await fs.readFile(fullPath);
            const mimeType = getMimeType(path.extname(filePath));
            return new Response(fileContent, { headers: { 'Content-Type': mimeType } });
        } catch (error) {
            console.error('Error handling dynnotch protocol:', error);
            return new Response('Not Found', { status: 404 });
        }
    });
}

app.whenReady().then(async () => {
    await registerProtocol();
    await registerIPCCallbacks();

    const allDisplays = screen.getAllDisplays();
    allDisplays.forEach(createWindow);
});

app.on('window-all-closed', () => {
    app.quit();
});