const { ipcRenderer } = require('electron');

let latestGameVersion = null;

// Main UI elements
const launchGameBtn = document.getElementById('launch-game-btn');
const updateGameBtn = document.getElementById('update-game-btn');
const setupContainer = document.getElementById('setup-container');
const downloadContainer = document.getElementById('download-container');

// Control buttons
const selectPathBtn = document.getElementById('select-path-btn');
const startDownloadBtn = document.getElementById('start-download-btn');
const closeBtn = document.getElementById('close-btn');
const settingsBtn = document.getElementById('settings-btn');
const minimizeBtn = document.getElementById('minimize-btn');
const setupStatusText = document.getElementById('setup-status-text');

// Progress bar
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Modal window
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const changePathBtn = document.getElementById('change-path-btn');
const pathDisplay = document.getElementById('current-path-display');
const errorMsg = document.getElementById('launch-error-msg');
const gameVersionDisplay = document.getElementById('game-version-display');

// Settings elements
const closeOnLaunchCheck = document.getElementById('close-on-launch-check');
const launchArgsInput = document.getElementById('launch-args-input');
const resetSettingsBtn = document.getElementById('reset-settings-btn');

// News section
const newsContent = document.getElementById('updates-content');
const tickerText = document.getElementById('ticker-text');
const tickerWrap = document.querySelector('.ticker-wrap');

document.addEventListener('DOMContentLoaded', () => {
  loadNews().then(() => {
    initializeApp();
  });

  loadTickerText();
  setInterval(loadTickerText, 60000);
});



ipcRenderer.invoke('get-app-version').then((version) => {
    const versionSpan = document.getElementById('app-version');
    if (versionSpan) {
      versionSpan.textContent = `v${version}`;
    }
  });


async function initializeApp() {
  const status = await ipcRenderer.invoke('get-game-status');
  updateUI(status);
}


async function loadNews() {
  const response = await ipcRenderer.invoke('get-news');
  

  if (response.status === 'ok') {
    latestGameVersion = response.latestVersion;
    newsContent.innerHTML = '';
    response.data.forEach(item => {
      const newsItem = document.createElement('div');
      newsItem.className = 'update-item';
      newsItem.innerHTML = `
          <h3>${item.date} <span class="version-tag">${item.version}</span></h3>
          <p>${item.text}</p>
      `;
      newsContent.appendChild(newsItem);
    });
  } else {
    newsContent.innerHTML = `<p style="color: #c00;">${response.message}</p>`;
  }
}

async function loadTickerText() {
    if (!tickerWrap || !tickerText) return;

    const response = await ipcRenderer.invoke('get-ticker-text');

    if (response.status === 'ok' && response.text && response.text.trim() !== '') {
        tickerWrap.classList.remove('hidden'); 
        tickerText.textContent = response.text.trim() + ' \u00A0 \u00A0 \u00A0 ';
        tickerText.style.animation = ''; 
        tickerText.style.paddingLeft = '100%'; 
    } else {
        tickerWrap.classList.add('hidden'); 
        tickerText.textContent = ''; 
    }
}

function updateUI(status) {
  launchGameBtn.classList.add('hidden');
  updateGameBtn.classList.add('hidden'); 
  setupContainer.classList.add('hidden');
  downloadContainer.classList.add('hidden');
  errorMsg.classList.add('hidden');

  gameVersionDisplay.textContent = '';

  switch (status.status) {
    case 'found':
      if (status.version === latestGameVersion && latestGameVersion !== null) {
        launchGameBtn.classList.remove('hidden');
      } else {
        if (latestGameVersion !== null) {
          updateGameBtn.classList.remove('hidden');
          updateGameBtn.textContent = `Обновить до ${latestGameVersion}`;
        }
      }
      pathDisplay.textContent = `${status.path} (${status.version || '???'})`;
      gameVersionDisplay.textContent = `Версия игры: ${status.version || '---'}`;
      break;
    
    case 'folder_selected':
      setupContainer.classList.remove('hidden');
      setupStatusText.textContent = `Установить в: ${status.path}` + '\\Mafia II Online';
      startDownloadBtn.disabled = false;
      selectPathBtn.textContent = 'Изменить папку';
      startDownloadBtn.style.backgroundColor = '#7a0000';
      selectPathBtn.style.backgroundColor = '#7a0000';
      
      selectPathBtn.textContent = 'Изменить папку';
      pathDisplay.textContent = 'Игра не установлена';
      break;

    default:
      setupContainer.classList.remove('hidden');
      setupStatusText.textContent = 'Папка для установки не выбрана';
      startDownloadBtn.disabled = true;
      selectPathBtn.textContent = 'Выбрать папку';
      
      if (status.status === 'invalid_path') {
        setupStatusText.textContent = 'Ошибка: не удалось найти игру по сохраненному пути.';
        pathDisplay.textContent = `Неверный путь: ${status.path}`;
      } else {
        pathDisplay.textContent = 'Не указан';
      }
      break;
  }
}

launchGameBtn.addEventListener('click', () => {
  errorMsg.classList.add('hidden');
  ipcRenderer.send('launch-game');
});

updateGameBtn.addEventListener('click', () => {
  updateGameBtn.classList.add('hidden');
  downloadContainer.classList.remove('hidden');
  ipcRenderer.send('start-update', latestGameVersion);
});

selectPathBtn.addEventListener('click', async () => {
  const status = await ipcRenderer.invoke('select-install-folder');
  if (status.status !== 'canceled') {
    updateUI(status);
  }
});

startDownloadBtn.addEventListener('click', () => {
  setupContainer.classList.add('hidden');
  downloadContainer.classList.remove('hidden');
  ipcRenderer.send('start-real-download', latestGameVersion);
});

changePathBtn.addEventListener('click', async () => {
  const status = await ipcRenderer.invoke('select-game-exe');
  if (status.status !== 'canceled') {
    updateUI(status);
    settingsModal.classList.add('hidden');
  }
});



minimizeBtn.addEventListener('click', () => ipcRenderer.send('minimize-app'));
closeBtn.addEventListener('click', () => ipcRenderer.send('close-app'));
closeModalBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));


settingsBtn.addEventListener('click', async () => {
    settingsModal.classList.remove('hidden');

    const settings = await ipcRenderer.invoke('get-all-settings');
    errorMsg.textContent = '';
    errorMsg.classList.add('hidden');
    closeOnLaunchCheck.checked = settings.closeOnLaunch || false;
    launchArgsInput.value = settings.launchArgs || "";
});




closeOnLaunchCheck.addEventListener('change', () => {
    ipcRenderer.send('save-setting', 'closeOnLaunch', closeOnLaunchCheck.checked);
});


launchArgsInput.addEventListener('input', () => {
    ipcRenderer.send('save-setting', 'launchArgs', launchArgsInput.value);
});


resetSettingsBtn.addEventListener('click', () => {

    if (confirm('Вы уверены, что хотите сбросить все настройки? Лаунчер перезагрузится.')) {
        ipcRenderer.send('reset-settings');
    }
});



ipcRenderer.on('download-progress-update', (event, update) => {
    const percent = Math.round(update.progress);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = update.text || `${percent}%`; 
});

ipcRenderer.on('download-error', (event, message) => {
    downloadContainer.classList.add('hidden'); 
    setupContainer.classList.remove('hidden'); 
    
    setupStatusText.textContent = `Ошибка: ${message}`; 
    startDownloadBtn.disabled = false; 
});

ipcRenderer.on('install-complete', () => {
    console.log('Install/Update complete signal received.'); 
    downloadContainer.classList.add('hidden');
    progressText.textContent = 'Завершено!'; 

    initializeApp(); 
});

ipcRenderer.on('launch-error', (event, message) => {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    settingsModal.classList.remove('hidden');
});