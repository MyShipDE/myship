const { app, systemPreferences, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");

let win = null;

const createWindow = async () => {
  try {

    if (win != null) {
      return;
    }

    try {
      await systemPreferences.askForMediaAccess('microphone');
    } catch (e) {
      //
    }

    win = new BrowserWindow({
      width: 1124,
      height: 700,
      icon: __dirname + '/assets/icon.png',
    })

    win.on('closed', () => {
      win = null
    })

    win.maximize();
    win.setFullScreen(true);

    await win.loadURL(url.format({
      pathname: path.join(
        __dirname,
        'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }))

  } catch (e) {
    //
  }
}

app.on('ready', createWindow);

app.on('activate', async () => {
    if (win === null) {
        await createWindow()
    }
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})
