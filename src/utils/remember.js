const config = require("../config.json");
const fileSys = require("fs-jetpack");
const crypto = require("./crypto");

function IsRememberFile() {
  let isFile = fileSys.find(fileSys.path(), {
    matching: `./${config.rememberFile}`,
    files: true,
    directories: false,
  });

  if (isFile.length > 0) {
    return true;
  }

  return false;
}

function generateRememberFile(data) {
  deleteRememberFile();
  data = JSON.stringify(data);

  let encryptedData = crypto.aesEncrypt(data).toString();
  fileSys.writeAsync(config.rememberFile, encryptedData);
}

function deleteRememberFile() {
  let isFile = fileSys.find(fileSys.path(), {
    matching: `./${config.rememberFile}`,
    files: true,
    directories: false,
  });

  if (isFile.length > 0) {
    isFile.forEach(fileSys.remove);
  }
}

exports.IsRememberFile = () => IsRememberFile();
exports.deleteRememberFile = () => deleteRememberFile();
exports.generateRememberFile = (data) => generateRememberFile(data);