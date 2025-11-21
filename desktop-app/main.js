const path = require('path');
const { app, BrowserWindow, nativeTheme } = require('electron');

const createWindow = () => {
  nativeTheme.themeSource = 'light';

  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: '水墨出题助手（桌面版）',
    backgroundColor: '#f7f2e9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  });

  const htmlPath = path.join(__dirname, '..', 'study-app.html');
  win.loadFile(htmlPath);

  win.removeMenu();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
