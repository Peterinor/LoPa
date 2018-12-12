const {
    app,
    dialog,
    BrowserWindow
} = require('electron');

const {
    ipcMain
} = require('electron');

const path = require('path');
const url = require('url');

let win;

function createWindow() {

    win = new BrowserWindow({
        minWidth: 900,
        minHeight: 700,
        width: 1280,
        height: 768,
        autoHideMenuBar: true,
        frame: false
    });

    win.loadURL(url.format({
        // pathname: path.join(__dirname, 'vr.html'),
        // pathname: path.join(__dirname, 'react-demo.html'),
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        // slashes: true
    }));

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null
    });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
    /*if (process.platform !== 'darwin') {
        app.quit()
    }*/
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});


var hd = {
    'open.file': (event) => {
        dialog.showOpenDialog({
            title: 'Open Log File',
            properties: ['openFile', 'multiSelections']
        }, function(files) {
            event.sender.send('open.file', files);
        });
    },
    'close.win': () => {
        if (win) win.close();
    },
    'max.win': () => {
        if (win) {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    },
    'min.win': () => {
        if (win) win.minimize();
    },
    'reload.win': () => {
        if (win) win.reload();
    },
    'toggledevtools': () => {
        if (win) win.webContents.toggleDevTools()
    }
}

for (var evt in hd) {
    ipcMain.on(evt, hd[evt]);
}

ipcMain.on('process', (event, pec) => {});