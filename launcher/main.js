const { app, BrowserWindow, ipcMain, dialog, net, shell, session} = require('electron');
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


ipcMain.handle('select-install-folder', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Выберите папку для установки ИЛИ папку с уже установленной игрой', 
        properties: ['openDirectory']
    });

    if (canceled) {
        return { status: 'canceled' };
    }

    const selectedPath = filePaths[0]; 
    const installDirName = "Mafia II Online";
    const potentialGameExeName = 'mafia2.exe'; 

    let finalInstallPath = ''; 
    let finalGamePath = '';   
    let baseInstallPath = ''; 


    if (path.basename(selectedPath).toLowerCase() === installDirName.toLowerCase()) {
        finalInstallPath = selectedPath; 
        finalGamePath = path.join(finalInstallPath, potentialGameExeName);
        baseInstallPath = selectedPath; 
    } else {

        finalInstallPath = path.join(selectedPath, installDirName);
        finalGamePath = path.join(finalInstallPath, potentialGameExeName);
        baseInstallPath = selectedPath; 
    }


    const settings = loadSettings();

    try {
        await fs.promises.access(finalGamePath, fs.constants.R_OK);
        saveSettings({
            ...settings,
            installPath: finalInstallPath, 
            gamePath: finalGamePath,      
            currentVersion: settings.currentVersion
        });
        return { status: 'found', path: finalGamePath, version: settings.currentVersion };

    } catch (error) {
        saveSettings({
            ...settings,
            installPath: baseInstallPath,
            gamePath: null,
            currentVersion: null
        });


        return { status: 'folder_selected', path: baseInstallPath };
    }
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

ipcMain.on('start-real-download', async (event, latestVersion) => {
    const settings = loadSettings();
    const selectedPath = settings.installPath; 
    if (!selectedPath) {
        event.reply('download-error', 'Папка для установки не выбрана!');
        return;
    }

    const installDirName = "Mafia II Online";
    const targetInstallPath = path.join(selectedPath, installDirName); 

    try {
        await fs.promises.mkdir(targetInstallPath, { recursive: true });
    } catch (error) {
        console.error('Не удалось создать папку установки:', error);
        event.reply('download-error', `Ошибка: Не удалось создать папку ${installDirName}. Проверьте права доступа.`);
        return;
    }

    const filesToDownload = [
        'site/game_files/mafia2.exe',
        'site/game_files/data.pak',
        'site/game_files/image.png'
    ];

    const totalFiles = filesToDownload.length;
    let downloadedFiles = 0;
    const downloadSession = session.defaultSession;

    event.reply('download-progress-update', { progress: 0, text: `Подготовка к загрузке ${totalFiles} файлов в ${installDirName}...` });

    const downloadFile = (fileUrlPath) => new Promise((resolve, reject) => {
        const url = `http://127.0.0.1:3000/${fileUrlPath}`;
        const fileName = path.basename(fileUrlPath);


        const savePath = path.join(targetInstallPath, fileName); 

        downloadSession.downloadURL(url);
        downloadSession.once('will-download', (e, item, webContents) => {
            item.setSavePath(savePath);
            item.on('updated', (evt, state) => {
                if (state === 'progressing') {
                    const fileProgress = item.getTotalBytes() ? (item.getReceivedBytes() / item.getTotalBytes() * 100) : 0;
                    event.reply('download-progress-update', {
                        progress: (downloadedFiles / totalFiles) * 100,
                        text: `Загрузка (${downloadedFiles + 1}/${totalFiles}): ${fileName} (${fileProgress.toFixed(1)}%)`
                    });
                } else if (state === 'interrupted') {
                    reject(new Error(`Загрузка ${fileName} прервана`));
                }
            });
            item.once('done', (evt, state) => {
                if (state === 'completed') {
                    downloadedFiles++;
                    event.reply('download-progress-update', {
                        progress: (downloadedFiles / totalFiles) * 100,
                        text: `Файл ${fileName} загружен (${downloadedFiles}/${totalFiles})`
                    });
                    resolve();
                } else {
                    reject(new Error(`Не удалось загрузить ${fileName}: ${state}`));
                }
            });
        });
    });

    try {
        for (const fileUrlPath of filesToDownload) {
            await downloadFile(fileUrlPath);
        }

        const gameExePath = path.join(targetInstallPath, 'mafia2.exe'); 
        saveSettings({ 
            ...settings, 
            installPath: targetInstallPath,
            gamePath: gameExePath, 
            currentVersion: latestVersion || BASE_INSTALL_VERSION 
        });

        event.reply('install-complete');

    } catch (error) {
        console.error('Ошибка во время загрузки:', error);
        event.reply('download-error', `Ошибка загрузки: ${error.message}`);
    } finally {
        downloadSession.removeAllListeners('will-download');
    }
});

ipcMain.on('download-error', (event, message) => {
    console.error("Download Error (from renderer):", message);
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

    event.reply('download-progress-update', { 
      progress: progress, 
      text: `Обновление... ${Math.round(progress)}%` 
  });

    if (progress === 100) {
      clearInterval(interval);
      saveSettings({ ...settings, currentVersion: newVersion });
      event.reply('install-complete');
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