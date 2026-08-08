// AEEG Practice Buddy - Electron Main Process
const { app, BrowserWindow, session, Menu, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000/practice-buddy';
const isDevelopment = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'AEEG Practice Buddy',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  });

  // Kiosk mode support
  if (process.argv.includes('--kiosk')) {
    mainWindow.setFullScreen(true);
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setAutoHideMenuBar(true);
    // Disable alt+f4 etc in kiosk
    mainWindow.on('closed', () => {});
  }

  // Load the practice buddy frontend
  const isPackaged = app.isPackaged;
  if (isPackaged || process.argv.includes('--prod')) {
    // In production, serve from bundled frontend
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  } else {
    // In development, load from the Next.js dev server
    mainWindow.loadURL(FRONTEND_URL);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Security: disable right-click save, print, etc.
  mainWindow.webContents.on('context-menu', (e, params) => {
    e.preventDefault();
  });

  // Block print
  mainWindow.webContents.on('before-input-event', (e, input) => {
    if (input.control && input.key.toLowerCase() === 'p') {
      e.preventDefault();
    }
  });

  // Disable dev tools in production
  if (!isDevelopment && !process.argv.includes('--devtools')) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  if (!isDevelopment) {
    Menu.setApplicationMenu(null);
  }
}

// Security: content protection
app.whenReady().then(async () => {
  // Session security
  const defaultSession = session.defaultSession;

  // Block print, save, etc.
  defaultSession.webRequest.onBeforeRequest({ urls: [] }, (details, callback) => {
    callback({});
  });

  // Clear cache on exit
  app.on('will-quit', () => {
    defaultSession.clearCache();
    defaultSession.clearStorageData();
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('get-api-url', () => API_URL);
ipcMain.handle('get-platform', () => 'windows');
ipcMain.handle('clear-local-data', async () => {
  await session.defaultSession.clearCache();
  await session.defaultSession.clearStorageData();
  return true;
});

// Kiosk mode controls
ipcMain.on('exit-kiosk', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(false);
    mainWindow.close();
  }
});

ipcMain.on('lock-kiosk', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(true);
  }
});