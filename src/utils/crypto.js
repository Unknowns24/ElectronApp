const cryptoJs = require("crypto-js");
const getmac = require('getmac');
const { base64encode } = require("nodejs-base64");

function aesEncrypt(string) {
    let macAddress = getmac.default();
    let macHash = cryptoJs.MD5(base64encode(macAddress.toString())).toString(); // Md5 of base64 of the mac address

    return cryptoJs.AES.encrypt(string, macHash);       
}

function aesDecrypt(text) {
    let macAddress = getmac.default();
    let macHash = cryptoJs.MD5(base64encode(macAddress)).toString(); // Md5 of base64 of the mac address
    
    let result = cryptoJs.AES.decrypt(text, macHash);       
    result = result.toString(cryptoJs.enc.Utf8);
    return result; 
}

exports.aesEncrypt = (string) => aesEncrypt(string);
exports.aesDecrypt = (text) => aesDecrypt(text);