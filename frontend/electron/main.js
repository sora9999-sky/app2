// Electron main process for Dinar Desk.
// - Creates a single window
// - Persists app data as JSON in app.getPath('userData')
// - Exposes safe IPC channels via preload.js

const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const isDev = !app.isPackaged;
const DATA_FILE = 'dinar-desk-data.json';

function dataPath() {
  return path.join(app.getPath('userData'), DATA_FILE);
}

async function ensureDir(p) {
  await fsp.mkdir(path.dirname(p), { recursive: true });
}

async function readDataFile() {
  const p = dataPath();
  try {
    const buf = await fsp.readFile(p, 'utf-8');
    if (!buf || !buf.trim()) return null;
    return JSON.parse(buf);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    console.error('readDataFile error', e);
    return null;
  }
}

async function writeDataFile(obj) {
  const p = dataPath();
  await ensureDir(p);
  const tmp = p + '.tmp';
  const json = JSON.stringify(obj, null, 2);
  await fsp.writeFile(tmp, json, 'utf-8');
  await fsp.rename(tmp, p);
  return true;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#f0f9ff',
    title: 'Dinar Desk',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Hide top menu for clean desktop look (still keep dev shortcuts in dev mode).
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  // Block external navigation; open external links in default browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev && process.env.ELECTRON_START_URL) {
    win.loadURL(process.env.ELECTRON_START_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(__dirname, '..', 'build', 'index.html');
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// === IPC handlers ===
ipcMain.handle('app:loadData', async () => {
  return await readDataFile();
});

ipcMain.handle('app:saveData', async (_evt, data) => {
  try {
    await writeDataFile(data);
    return { ok: true };
  } catch (e) {
    console.error('saveData failed', e);
    return { ok: false, error: String(e) };
  }
});

ipcMain.handle('app:exportBackup', async (evt, jsonString) => {
  const win = BrowserWindow.fromWebContents(evt.sender);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const res = await dialog.showSaveDialog(win, {
    title: 'Export Dinar Desk Backup',
    defaultPath: `dinar-desk-backup-${ts}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (res.canceled || !res.filePath) return { ok: false };
  await fsp.writeFile(res.filePath, jsonString, 'utf-8');
  return { ok: true, path: res.filePath };
});

ipcMain.handle('app:importBackup', async (evt) => {
  const win = BrowserWindow.fromWebContents(evt.sender);
  const res = await dialog.showOpenDialog(win, {
    title: 'Import Dinar Desk Backup',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (res.canceled || !res.filePaths[0]) return { ok: false };
  const json = await fsp.readFile(res.filePaths[0], 'utf-8');
  return { ok: true, json };
});

ipcMain.handle('app:dataPath', async () => dataPath());
