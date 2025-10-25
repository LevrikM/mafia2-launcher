# Mafia II Online - Custom Launcher

<p align="center">
  <strong>Атмосферный лаунчер для РП-проекта "Mafia II Online" (Разработано LEVRO)</strong>
</p>

<p align="center">
  <img width="700" alt="Главный экран лаунчера" src="https://github.com/user-attachments/assets/9c4bc0ca-79b8-4ef0-bf6b-421adb399ab4" />
</p>

<p align="center">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=electron&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</p>

---

## 🚀 О проекте

Этот репозиторий содержит код для кастомного лаунчера, созданного на **Electron**, и простого бэкенд-сайта для него. Лаунчер разработан с нуля в стиле Mafia II и включает в себя весь необходимый функционал для РП-проекта.

### 🌟 Основные возможности

* **Динамические новости:** Лаунчер загружает новости и список версий прямо с подключенного сайта (`/site/api/news.json`).
* **Проверка версий:** Автоматически сравнивает локальную версию игры с последней версией на сервере и предлагает "Обновить".
* **Установка игры:** Включает (пока) фейковую логику установки: выбор папки, "загрузка" с прогресс-баром и сохранение пути.
* **Панель настроек:**
    * Изменение пути к игре.
    * Галочка "Закрывать лаунчер при запуске".
    * Поле для кастомных параметров запуска (например, `-windowed`).
    * Полный сброс настроек с перезагрузкой.
* **Кастомный дизайн:** Весь интерфейс, включая рамку окна, кнопки (свернуть, закрыть) и скроллбар, стилизован под атмосферу Mafia II.

---

## 🛠️ Используемые технологии

* **Electron:** Для создания десктопного приложения из веб-технологий.
* **Node.js (fs, path, net):** Для работы с файловой системой (сохранение настроек) и сетью (загрузка новостей).
* **HTML5 / CSS3 / JavaScript:** Для всего интерфейса и логики.

<p align="center">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=electron&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</p>

---

## 📦 Установка и запуск

Проект разделен на две части: `/launcher` (само приложение) и `/site` (сайт для новостей).

### 1. Запуск сайта (Бэкенд)

Сайт статичный, но для загрузки `news.json` через `http://` (вместо `file://`) его нужно подавать через локальный сервер.

1.  Установите `serve` (если его нет):
    ```bash
    npm install -g serve
    ```
2.  Запустите сервер из **корневой папки проекта**:
    ```bash
    serve
    ```
    *После этого сайт будет доступен по адресу `http://localhost:3000` (или похожему), а API новостей — по `http://localhost:3000/site/api/news.json`.*

### 2. Запуск лаунчера

1.  Перейдите в папку лаунчера:
    ```bash
    cd launcher
    ```
2.  Установите зависимости:
    ```bash
    npm install
    ```
3.  Запустите лаунчер в режиме разработки:
    ```bash
    npm start
    ```
### 3. Сборка лаунчера (Создание .exe)

Проект использует **Electron Forge** для автоматической сборки приложения в `.exe` установщик.

1.  **Иконка:** Убедитесь, что в папке `/launcher` лежит файл `icon.ico`. Он будет автоматически использован для `.exe` файла и установщика (конфигурация уже в `package.json`).

2.  Выполните команду в терминале (в папке `/launcher`):
    ```bash
    npm run make
    ```
3.  Готовый установщик будет находиться в папке:
    ```
    /launcher/out/make/squirrel.windows/x64/
    ```
---

## 🖼️ Галерея

<h3 align="center">Интерфейс Лаунчера</h3>

<table align="center">
  <tr>
    <td align="center"><img width="420" alt="Новости" src="https://github.com/user-attachments/assets/ac857230-a0a0-487f-8861-844b6dc797bd"><br><b>Новости</b></td>
    <td align="center"><img width="420" alt="Обновление" src="https://github.com/user-attachments/assets/bff8d04b-2292-49a4-8768-c0fd5f384547"><br><b>Проверка версии</b></td>
  </tr>
  <tr>
    <td align="center"><img width="420" alt="Установка" src="https://github.com/user-attachments/assets/af579de4-3b3e-441c-a491-1d6b04b7030b"><br><b>Прогресс-бар</b></td>
    <td align="center"><img width="420" alt="Настройки" src="https://github.com/user-attachments/assets/45e2aade-bfbc-4c62-ae9e-0d607311e600"><br><b>Настройки</b></td>
  </tr>
</table>

<h3 align="center">Интерфейс Сайта</h3>

<table align="center">
  <tr>
    <td align="center"><img width="420" alt="Главная сайта" src="https://github.com/user-attachments/assets/c9742e23-fe35-4b04-aaa9-0f6d80b5bb17"><br><b>Главная страница</b></td>
    <td align="center"><img width="420" alt="Сообщество" src="https://github.com/user-attachments/assets/8d2b5f0f-2500-4b46-9af7-4fce16836840"><br><b>Сообщество (Досье и галерея)</b></td>
  </tr>
  <tr>
    <td align="center"><img width="420" alt="Как играть" src="https://github.com/user-attachments/assets/52b7b0aa-11f4-4bc6-9318-a49a25c05035"><br><b>Как начать</b></td>
    <td align="center"><img width="420" alt="Новости сайта" src="https://github.com/user-attachments/assets/4d93d6b2-8735-4ddb-9750-e2dea649dd92"><br><b>Лента новостей (Сайт)</b></td>
  </tr>
</table>


## 📞 Связь со мной

* **Discord:** `m.levro`
*  **Telegram**: <a href="https://t.me/xwkwx">`t.me/xwkwx`</a></p>
