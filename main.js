// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Optional: auto-reload during development
try {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  });
} catch (_) {
  console.log('electron-reload not installed, skipping auto-reload');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // allows Node.js in renderer
    },
  });

  win.loadFile('index.html'); // Your front-end file
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit(); // Quit on Windows/Linux
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});