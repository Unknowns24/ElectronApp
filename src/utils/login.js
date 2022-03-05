const rdf = require("./remember");
const main = require("./../index");
const crypto = require("./crypto");
const fileSys = require("fs-jetpack");
const { session } = require("electron");
const config = require("./../config.json");
const notification = require("./notification");
const fetch = require("electron-fetch").default;
const cookieParser = require("set-cookie-parser");
const { base64encode, base64decode } = require("nodejs-base64");

async function loginUser(email, password, remember) {
    try {
      let base64Data = base64encode(
        JSON.stringify({ email: email, password: password, keeplogin: "true" })
      );
      let reqContent = { data: base64Data };
  
      fetch(`${config.gatewayURL}/api/v1/login`, {
        method: "POST",
        body: JSON.stringify(reqContent),
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      })
        .then(async (res) => {
          data = await res.json();
  
          let code = data.message;
          if (code !== undefined && code.includes("SUCN")) {
            let cookies = cookieParser.parse(
              cookieParser.splitCookiesString(res.headers.get("set-cookie")),
              { decodeValues: true }
            );
            let finded = false;
            cookies.forEach((cookie) => {
              if (cookie.name === "jwt") {
                session.defaultSession.cookies.set({
                  url: config.gatewayURL,
                  httpOnly: true,
                  name: cookie.name,
                  value: cookie.value,
                  expirationDate: cookie.expires,
                });
                finded = true;
              }
            });
  
            if (finded) {
              if (remember && !rdf.IsRememberFile()) {
                rdf.generateRememberFile(reqContent);
              } else if (!remember && rdf.IsRememberFile()) {
                rdf.deleteRememberFile();
              }
  
              return main.openMainWindow();
            }
          }
  
          notification.showNotification("Login Exception", "Incorrect login credentials!", true);
        })
        .catch((err) => {
            console.log(err);
            notification.showNotification("Login Exception", "Cannot login, try again later!", true);
        });
    } catch (err) {
      console.log(err);
      notification.showNotification("Login Exception", "Cannot login, try again later!", true);
    }
}
  
async function loginWithRememberFile() {
    try {
      const data = await fileSys.readAsync(
        `${fileSys.path()}/${config.rememberFile}`
      );
      let decryptedData = crypto.aesDecrypt(data);
  
      fetch(`${config.gatewayURL}/api/v1/login`, {
        method: "POST",
        body: decryptedData,
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
      })
        .then(async (res) => {
          let resData = await res.json();  
          let code = resData.message;
          
          if (code !== undefined && code.includes("SUCN")) {
            let cookies = cookieParser.parse(
              cookieParser.splitCookiesString(res.headers.get("set-cookie")),
              { decodeValues: true }
            );
            let finded = false;
            cookies.forEach((cookie) => {
              if (cookie.name === "jwt") {
                session.defaultSession.cookies.set({
                  url: config.gatewayURL,
                  httpOnly: true,
                  name: cookie.name,
                  value: cookie.value,
                  expirationDate: cookie.expires,
                });
                finded = true;
              }
            });
            
            if (finded) {
              return main.openMainWindow();
            }
          }
  
          main.openLoginWindow();
        })
        .catch(() => {
          main.openLoginWindow();
        });
    } catch {
      main.openLoginWindow();
    }
}

exports.loginUser = async (email, password, remember) => loginUser(email, password, remember)
exports.loginWithRememberFile = async () => loginWithRememberFile()