const { app, BrowserWindow, ipcMain, dialog, net, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const BASE_INSTALL_VERSION = "v1.0";

const storePath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(storePath)) {
      const data = fs.readFileSync(storePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Не удалось загрузить настройки:', error);
  }
  
  return { 
    gamePath: null, 
    installPath: null, 
    currentVersion: null,
    closeOnLaunch: false,
    launchArgs: "" 
  };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(settings));
  } catch (error) {
    console.error('Не удалось сохранить настройки:', error);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    resizable: false,
    frame: false,
    maximizable: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile('index.html');
  win.setMenu(null);
  
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.handle('get-game-status', async () => {
  const settings = loadSettings();
  const gamePath = settings.gamePath;
  const installPath = settings.installPath;

  if (gamePath) {
    try {
      await fs.promises.access(gamePath, fs.constants.X_OK);
      return { status: 'found', path: gamePath, version: settings.currentVersion };
    } catch (error) {
      return { status: 'invalid_path', path: gamePath, version: null };
    }
  } else if (installPath) {
    return { status: 'folder_selected', path: installPath, version: null };
  } else {
    return { status: 'not_found', version: null };
  }
});

ipcMain.handle('select-install-folder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Выберите папку для установки игры',
    properties: ['openDirectory']
  });

  if (canceled) {
    return { status: 'canceled' };
  }

  const newInstallPath = filePaths[0];
  const settings = loadSettings();
  saveSettings({ ...settings, installPath: newInstallPath, gamePath: null, currentVersion: null });

  return { status: 'folder_selected', path: newInstallPath };
});

ipcMain.on('launch-game', (event) => {
  const settings = loadSettings();
  
  if (settings.gamePath) {
    const launchArgs = settings.launchArgs || "";
    console.log(`Запускаем: ${settings.gamePath} ${launchArgs}`);
    
    exec(`"${settings.gamePath}" ${launchArgs}`, { cwd: path.dirname(settings.gamePath) }, (error) => {
      if (error) {
        console.error(`Ошибка запуска: ${error}`);
        event.reply('launch-error', 'Не удалось запустить игру. Проверьте путь или обратитесь в поддержку.');
      }
    });
    
    if (settings.closeOnLaunch) {
        app.quit();
    }
    
  } else {
    event.reply('launch-error', 'Путь к игре не указан!');
  }
});

ipcMain.handle('get-news', async () => {
    
    const fetchNews = () => new Promise((resolve, reject) => {
        const url = 'http://127.0.0.1:3000/site/api/news.json';
        const request = net.request(url);

        let responseData = '';

        request.on('response', (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP Error: ${response.statusCode}`));
            }
            
            response.on('data', (chunk) => {
                responseData += chunk.toString('utf-8');
            });

            response.on('end', () => {
                resolve(responseData);
            });
            
            response.on('error', (error) => {
                reject(error);
            });
        });

        request.on('error', (error) => {
            reject(error);
        });
        request.end();
    });

    try {
        const jsonString = await fetchNews();
        
        const newsData = JSON.parse(jsonString);
        
        const latestVersion = newsData.length > 0 ? newsData[0].version : null;
        return { status: 'ok', data: newsData, latestVersion: latestVersion };

    } catch (error) {
        console.error('Ошибка загрузки новостей (HTTP):', error);
        
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
            return { status: 'error', message: '<b>Не удалось подключиться к новостной ленте.</b> <br><small>Проверьте подключение к интернету и попробуйте снова. <br>Так-же возможно сервер оффлайн.</small>' };
        }

        return { status: 'error', message: 'Не удалось загрузить новостую ленту.' };
    }
});

ipcMain.on('start-fake-download', (event, latestVersion) => {
    const settings = loadSettings();
    if (!settings.installPath) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        event.reply('download-progress', progress);

        if (progress === 100) {
            clearInterval(interval);
            const fakeGameExePath = path.join(settings.installPath, 'mafia2.exe');
            saveSettings({ ...settings, gamePath: fakeGameExePath, currentVersion: latestVersion || BASE_INSTALL_VERSION });
            event.reply('install-complete'); 
        }
    }, 300);
});

ipcMain.handle('select-game-exe', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Укажите путь к mafia2.exe',
    properties: ['openFile'],
    filters: [{ name: 'mafia2', extensions: ['exe'] }]
  });

  if (canceled) {
    return { status: 'canceled' };
  }

  const newPath = filePaths[0];
  saveSettings({ gamePath: newPath, installPath: path.dirname(newPath), currentVersion: null });
  return { status: 'found', path: newPath };
});

ipcMain.on('start-update', (event, newVersion) => {
  const settings = loadSettings();
  if (!settings.gamePath) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;

    event.reply('download-progress', progress);

    if (progress === 100) {
      clearInterval(interval);
      saveSettings({ ...settings, currentVersion: newVersion });
      event.reply('update-complete');
    }
  }, 250);
});

ipcMain.handle('get-ticker-text', async () => {
    
    const fetchTicker = () => new Promise((resolve, reject) => {
        const url = 'http://127.0.0.1:3000/site/api/ticker.txt';
        const request = net.request(url);
        let responseData = '';

        request.on('response', (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP Error: ${response.statusCode}`));
            }
            response.on('data', (chunk) => {
                responseData += chunk.toString('utf-8');
            });
            response.on('end', () => {
                resolve(responseData);
            });
            response.on('error', (error) => reject(error));
        });
        request.on('error', (error) => reject(error));
        request.end();
    });

    try {
        const text = await fetchTicker();
        return { status: 'ok', text: text };
    } catch (error) {
        console.error('Ошибка загрузки бегущей строки:', error);
        return { status: 'error', message: 'Не удалось загрузить срочные сообщения.' };
    }
});

ipcMain.handle('get-all-settings', async () => {
    return loadSettings();
});

ipcMain.on('save-setting', (event, key, value) => {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
});

ipcMain.on('reset-settings', (event) => {
    if (fs.existsSync(storePath)) {
        fs.unlinkSync(storePath); 
    }

    const win = BrowserWindow.fromWebContents(event.sender);
    win.reload();
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.on('minimize-app', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.minimize();
});

ipcMain.on('close-app', () => {
  app.quit();
});