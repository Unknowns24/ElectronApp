const user = require("./utils/user")
const login = require("./utils/login");
const config = require("./config.json");
const rdf = require("./utils/remember");
const license = require("./utils/license");
const notification = require("./utils/notification");
const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow = null; // Initialize main windows variable
let splash = null; // Initialize main windows variable

// Set app user model id if the OS is windows
if (process.platform === "win32") {
  app.setAppUserModelId(config.appName);
}

/* Main Event */
app.addListener("ready", () => {
  splash = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "%AppName% - Login",
    resizable: false,
    icon: `${__dirname}/public/img/logo.ico`,
    height: 400,
    width: 300,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadURL(`file://${__dirname}/views/splash.html`);
  splash.setMenuBarVisibility(false);
  
  splash.once("ready-to-show", () => {
    splash.show();
    
    setTimeout(() => {
      if (rdf.IsRememberFile() === false) {
        openLoginWindow();
        return;
      }
    
      login.loginWithRememberFile();
    }, 2000)
  });
});

/* Events */

ipcMain.on("notification:new", (e, data) => {
  notification.showNotification(data.title, data.msg, data.error);
});

ipcMain.on("main:close", (e) => {
  closeMainWindow();
});

ipcMain.on("main:minimize", (e) => {
  if (mainWindow !== null) {
    mainWindow.minimize();
  }
});

ipcMain.on("login:attempt", (e, data) => {
  login.loginUser(data.email, data.password, data.remember); // Login user
});

/* Functions */

function openLoginWindow() {
  let loginWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "%AppName%",
    resizable: false,
    icon: `${__dirname}/public/img/logo.ico`,
    height: 600,
    frame: false,
  });

  loginWindow.loadURL(`file://${__dirname}/views/login.html`);
  loginWindow.setMenuBarVisibility(false);

  loginWindow.once("ready-to-show", () => {
    if (splash !== null) {
      splash.destroy();
    }

    if (mainWindow !== null && mainWindow !== undefined) {
      mainWindow.destroy()
    }

    loginWindow.show();
  });

  loginWindow.on("close", () => {
    loginWindow = null;
    closeMainWindow();
  });

  ipcMain.on("login:minimize", (e) => {
    loginWindow.minimize();
  });
}

function openMainWindow() {
  if (!license.IsLicenseFile()) {
    openLicenseWindow();
    return;
  }

  let userLicense = license.getStoredLicense();
  license.createVerificationRutine(userLicense);

  user.loadUser();

  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "%AppName%",
    resizable: false,
    icon: `${__dirname}/public/img/logo.ico`,
    height: 500,
    width: 400,
    frame: false,
    alwaysOnTop: false,
  });

  mainWindow.loadURL(`file://${__dirname}/views/main.html`);

  mainWindow.once("ready-to-show", () => {
    if (splash !== null) {
      splash.destroy();
    }

    mainWindow.show();
  });

  //mainWindow.setSize(800, 500, true);
}

function openLicenseWindow() {
  let licenseWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: "%AppName% - License",
    resizable: false,
    icon: `${__dirname}/public/img/logo.ico`,
    height: 180,
    width: 460,
    frame: false,
    alwaysOnTop: true,
  });

  licenseWindow.loadURL(`file://${__dirname}/views/license.html`);
  licenseWindow.setMenuBarVisibility(false);

  licenseWindow.once("ready-to-show", () => {
    if (splash !== null) {
      splash.destroy();
    }

    licenseWindow.show();
  });

  ipcMain.on("license:create", async (e, data) => {
    if (await license.verifyUserLicense(data.license)) {
      licenseWindow.destroy();
      await license.generateLicenseFile(data.license);
      openMainWindow();
    }
  });
}

function closeMainWindow() {
  app.quit();
  mainWindow = null;
}

// Window Open export 
exports.openMainWindow = () => openMainWindow();
exports.openLoginWindow = () => openLoginWindow();
exports.openLicenseWindow = () => openLicenseWindow();