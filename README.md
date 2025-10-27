<p align="right">
  <a href="README.md"><b>English</b></a> | <a href="README_RU.md">Русский</a>
</p>

<h1 align="center"> Mafia II Online - Custom Launcher + Website</h1>

<p align="center">
  <strong>Atmospheric launcher and website for the "Mafia II Online" RP project</strong>
</p>

<p align="center">
  <img width="700" alt="Launcher main screen" src="https://github.com/user-attachments/assets/1ec3e203-1464-45ff-85ab-6e2ffced31de" />
</p>

<p align="center">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=electron&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</p>

---

## 🚀 About The Project

This repository contains the code for a custom launcher built with **Electron** and a simple backend website for it. The launcher was developed from scratch in the style of Mafia II and includes all the necessary functionality for an RP project.

### 🌟 Key Features

* **Dynamic News:** The launcher loads news and version lists directly from the connected website (`/site/api/news.json`).
* **Version Check:** Automatically compares the local game version with the latest version on the server and prompts to "Update".
* **Game "Installation":** Includes installation logic: folder selection, "downloading" with a progress bar, and saving the path.
* **Settings Panel:**
    * Change game path.
    * Checkbox "Close launcher on game start".
    * Field for custom launch parameters (e.g., `-windowed`).
    * Full settings reset with a reload.
* **Custom Design:** The entire interface, including the window frame, buttons (minimize, close), and scrollbar, is styled to match the Mafia II atmosphere.

---

## 🛠️ Technologies Used

* **Electron:** To create a desktop application using web technologies.
* **Node.js (fs, path, net):** For working with the file system (saving settings) and network (loading news).
* **HTML5 / CSS3 / JavaScript:** For the entire interface and logic.

<p align="center">
  <img alt="Electron" src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=electron&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</p>

---

## 📦 Installation and Launch

The project is divided into two parts: `/launcher` (the application itself) and `/site` (the website for news).

### 1. Running the Website (Backend)

The site is static, but to load `news.json` via `http://` (instead of `file://`), it needs to be served through a local server.

1.  Install `serve` (if you don't have it):
    ```bash
    npm install -g serve
    ```
2.  Run the server from the **project root folder**:
    ```bash
    serve
    ```
    *After this, the site will be available at `http://localhost:3000` (or similar), and the news API at `http://localhost:3000/site/api/news.json`.*

### 2. Running the Launcher (Development)

1.  Navigate to the launcher directory:
    ```bash
    cd launcher
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the launcher in development mode:
    ```bash
    npm start
    ```

### 3. Building the Launcher (Creating .exe)

The project uses **Electron Forge** to automatically build the application into an `.exe` installer.

1.  **Icon:** Ensure the `icon.ico` file is present in the `/launcher` directory. It will be automatically used for the `.exe` file and the installer (configuration is already in `package.json`).

2.  Run the command in the terminal (in the `/launcher` directory):
    ```bash
    npm run make
    ```
3.  The finished installer will be located in the folder:
    ```
    /launcher/out/make/nsis/x64/
    ```

---

## 🖼️ Gallery

<h3 align="center">Launcher Interface</h3>

<table align="center">
  <tr>
    <td align="center"><img width="420" alt="News" src="https://github.com/user-attachments/assets/ac857230-a0a0-487f-8861-844b6dc797bd"><br><b>News Feed</b></td>
    <td align="center"><img width="420" alt="Update Prompt" src="https://github.com/user-attachments/assets/a344d675-247e-40ca-b59b-665177cb4e0d"><br><b>Version Check</b></td>
  </tr>
  <tr>
    <td align="center"><img width="420" alt="Installation Progress" src="https://github.com/user-attachments/assets/c5c4c37c-88c2-40bc-94dc-92810f313354"><br><b>Progress Bar</b></td>
    <td align="center"><img width="420" alt="Settings Panel" src="https://github.com/user-attachments/assets/45e2aade-bfbc-4c62-ae9e-0d607311e600"><br><b>Settings</b></td>
  </tr>
</table>

<h3 align="center">Website Interface</h3>

<table align="center">
  <tr>
    <td align="center"><img width="420" alt="Website Home" src="https://github.com/user-attachments/assets/1c8d1608-b465-470b-b73a-aa54b8e5c1a4"><br><b>Home Page</b></td>
    <td align="center"><img width="420" alt="Community Page" src="https://github.com/user-attachments/assets/fd622694-4d3e-48d3-9c6b-c011a81d21a7"><br><b>Community (Dossier & Gallery)</b></td>
  </tr>
  <tr>
    <td align="center"><img width="420" alt="Rules Page" src="https://github.com/user-attachments/assets/6f32aee4-55cb-4521-b54d-6b14a4b5d37b"><br><b>Rules</b></td>
    <td align="center"><img width="420" alt="How to Play Page" src="https://github.com/user-attachments/assets/cea7f95d-b802-4325-bd57-a538d7f4dce1"><br><b>How to Start</b></td>
  </tr>
   <tr>
    <td align="center"><img width="420" alt="Website News Feed" src="https://github.com/user-attachments/assets/4d93d6b2-8735-4ddb-9750-e2dea649dd92"><br><b>News Feed (Website)</b></td>
  </tr>
</table>

---

## 📞 Contact Me

* **Discord:** `m.levro`
* **Telegram**: <a href="https://t.me/xwkwx">`t.me/xwkwx`</a></p>
