'use strict';

const { app, BrowserWindow, dialog, utilityProcess } = require('electron');
const { access, cp, mkdir } = require('node:fs/promises');
const path = require('node:path');

app.setName('Atlas Austral');

let mainWindow = null;
let backend = null;
let backendExpectedToExit = false;
let quittingAfterBackend = false;

const MIN_ZOOM_FACTOR = 0.7;
const MAX_ZOOM_FACTOR = 1.3;
const ZOOM_STEP = 0.1;

const exists = file => access(file).then(() => true, () => false);

async function initializePersistentDirectory(appPath, userData, name) {
  const destination = path.join(userData, name);
  if (await exists(destination)) return destination;
  const seed = path.join(appPath, name);
  await mkdir(path.dirname(destination), { recursive: true });
  if (await exists(seed)) await cp(seed, destination, { recursive: true, force: false, errorOnExist: true });
  else await mkdir(destination, { recursive: true });
  return destination;
}

function waitForBackendReady(child) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`El backend no respondió a tiempo.${stderr ? `\n${stderr}` : ''}`)), 20_000);
    const cleanup = () => clearTimeout(timeout);

    child.stdout?.on('data', chunk => {
      stdout += chunk.toString('utf8');
      const lines = stdout.split(/\r?\n/);
      stdout = lines.pop() ?? '';
      for (const line of lines) {
        try {
          const message = JSON.parse(line);
          if (message.event === 'server.ready' && Number.isInteger(message.port)) {
            cleanup();
            resolve(message.port);
          }
        } catch { /* Los mensajes no estructurados no forman parte del protocolo de arranque. */ }
      }
    });
    child.stderr?.on('data', chunk => { stderr = `${stderr}${chunk.toString('utf8')}`.slice(-4000); });
    child.once('exit', code => {
      cleanup();
      reject(new Error(`El backend terminó antes de iniciar (código ${code}).${stderr ? `\n${stderr}` : ''}`));
    });
    child.once('error', error => {
      cleanup();
      reject(new Error(`No se pudo iniciar el backend: ${error.type ?? 'error desconocido'}`));
    });
  });
}

async function waitForHealth(origin) {
  let lastError;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch (error) { lastError = error; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`El backend arrancó pero no superó el control de salud: ${lastError?.message ?? 'sin respuesta'}`);
}

async function startBackend() {
  const appPath = app.getAppPath();
  const userData = app.getPath('userData');
  const dataDir = await initializePersistentDirectory(appPath, userData, 'maps-data');
  const mediaDir = await initializePersistentDirectory(appPath, userData, 'maps-multimedia');
  const privateDir = path.join(userData, 'config-private');
  await mkdir(privateDir, { recursive: true });

  const loader = path.join(appPath, 'electron', 'backend-loader.cjs');
  backend = utilityProcess.fork(loader, [], {
    cwd: userData,
    env: {
      ...process.env,
      API_PORT: '0',
      MAPS_DATA_DIR: dataDir,
      MAPS_MULTIMEDIA_DIR: mediaDir,
      PRIVATE_CONFIG_DIR: privateDir,
      STATIC_DIR: path.join(appPath, 'dist'),
    },
    stdio: 'pipe',
    serviceName: 'Atlas Austral Backend',
  });

  backend.on('exit', code => {
    if (backendExpectedToExit) return;
    void dialog.showErrorBox('Atlas Austral', `El servidor local se cerró inesperadamente (código ${code}).`);
    app.quit();
  });
  const port = await waitForBackendReady(backend);
  const origin = `http://127.0.0.1:${port}`;
  await waitForHealth(origin);
  return origin;
}

function createWindow(origin) {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#101417',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  });
  window.once('ready-to-show', () => window.show());

  const setZoomFactor = factor => {
    const boundedFactor = Math.min(MAX_ZOOM_FACTOR, Math.max(MIN_ZOOM_FACTOR, factor));
    window.webContents.setZoomFactor(Number(boundedFactor.toFixed(1)));
  };

  window.webContents.on('zoom-changed', (event, direction) => {
    event.preventDefault();
    const delta = direction === 'in' ? ZOOM_STEP : -ZOOM_STEP;
    setZoomFactor(window.webContents.getZoomFactor() + delta);
  });

  window.webContents.on('before-input-event', (event, input) => {
    if (!input.control || input.type !== 'keyDown') return;

    if (input.key === '0' || input.code === 'Numpad0') {
      event.preventDefault();
      setZoomFactor(1);
      return;
    }

    const zoomIn = input.key === '+' || input.key === '=' || input.code === 'NumpadAdd';
    const zoomOut = input.key === '-' || input.code === 'NumpadSubtract';
    if (!zoomIn && !zoomOut) return;

    event.preventDefault();
    setZoomFactor(window.webContents.getZoomFactor() + (zoomIn ? ZOOM_STEP : -ZOOM_STEP));
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== origin) event.preventDefault();
  });
  void window.loadURL(origin);
  window.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
  return window;
}

async function stopBackend() {
  if (!backend || backendExpectedToExit) return;
  backendExpectedToExit = true;
  const child = backend;
  await new Promise(resolve => {
    const timeout = setTimeout(resolve, 5_000);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    if (!child.kill()) {
      clearTimeout(timeout);
      resolve();
    }
  });
  backend = null;
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    try {
      const origin = await startBackend();
      mainWindow = createWindow(origin);
    } catch (error) {
      dialog.showErrorBox('No se pudo iniciar Atlas Austral', error instanceof Error ? error.message : String(error));
      backendExpectedToExit = true;
      backend?.kill();
      app.quit();
    }
  });

  app.on('before-quit', event => {
    if (!backend || backendExpectedToExit || quittingAfterBackend) return;
    event.preventDefault();
    quittingAfterBackend = true;
    void stopBackend().finally(() => app.quit());
  });
}
