const getmac = require('getmac');
const main = require("./../index");
const fileSys = require("fs-jetpack");
const cryptoJs = require("crypto-js");
const config = require("./../config.json");
const fetch = require("electron-fetch").default;
const { base64encode } = require("nodejs-base64");

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getStoredLicense() {
    let isFile = fileSys.find(fileSys.path(), {
        matching: "./*.lic",
        files: true,
        directories: false,
    });

    if (isFile.length > 0) {
        return isFile[0].replace(".lic", "")
    }

    return null;
}

function IsLicenseFile() {
    let isFile = fileSys.find(fileSys.path(), {
        matching: "./*.lic",
        files: true,
        directories: false,
    });

    if (isFile.length > 0) {
        return true;
    }

    return false;
}

async function generateLicenseFile(license) {
    if (IsLicenseFile) {
        deleteLicenseFile();
    }

    let encryptedData = cryptoJs.MD5(license).toString();
    await fileSys.writeAsync(`${license}.lic`, encryptedData);
}

function deleteLicenseFile() {
    let isFile = fileSys.find(fileSys.path(), {
        matching: "./*.lic",
        files: true,
        directories: false,
    });

    if (isFile.length > 0) {
        isFile.forEach(fileSys.remove);
    }
}

async function verifyUserLicense(license) {
    try {
        let res = await fetch(`${config.gatewayURL}/api/v1/verify/pow/${config.appName}`, {
            method: "POST"
        })
        
        let data = await res.json();  
        let myToken = data.otherData + cryptoJs.MD5(license + config.secretKey).toString(); // otherData field concatenated to the userLicense 
    
        let base64Data = base64encode(JSON.stringify(
            { 
                token: myToken,
                macHash: cryptoJs.MD5(getmac.default()).toString(),  // MD5 of the mac address
            }
        ));
    
        let reqContent = { data: base64Data };
    
        let newRes = await fetch(`${config.gatewayURL}/api/v1/verify/${config.appName}/${license}`, {
            method: "POST",
            body: JSON.stringify(reqContent),
            headers: {
                "Content-Type": "application/json"
            }
        })
    
        let newResData = await newRes.json();  
        
        if (newResData.token !== undefined && newResData.token !== null) {
            let time = await fetch(`${config.gatewayURL}/api/v1/unixtime`)
            time = await time.json()
            let date = new Date(time * 1000);
    
            if (date.getMinutes() >= 55 || date.getMinutes() <= 5) {
                date.setTime(date.getTime() + (60 * 60 * 1000)) 
            }
    
            if (cryptoJs.MD5(myToken + date.getHours() + config.secretKey).toString() === newResData.token) {
                return true
            }
    
            return false
        }
    
        return false 
    } catch {
        return false
    }
}

async function createVerificationRutine(lic) {
    while (true) {
        await sleep(config.verificationTime);
        if (!await verifyUserLicense(lic)) {
            await sleep(1800000); // Wait 30min until try again..
            
            if (!await verifyUserLicense(lic)) {
                main.openLoginWindow();
            }
        }
    }
}

exports.IsLicenseFile = () => IsLicenseFile();
exports.getStoredLicense = () => getStoredLicense();
exports.deleteLicenseFile = () => deleteLicenseFile();
exports.verifyUserLicense = async (lic) => verifyUserLicense(lic);
exports.generateLicenseFile = async (lic) => generateLicenseFile(lic);
exports.createVerificationRutine = async (lic) => createVerificationRutine(lic);