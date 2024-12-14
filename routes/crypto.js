const express = require('express');
var router = express.Router();
var CryptoJS = require("crypto-js");
const crypto = require('crypto');
require('dotenv').config();

const aesUtil = {
    genKey: function (length = 1024) {
        return crypto.randomBytes(length).toString('base64').slice(0, length);
    },

    encrypt: function (plaintext, key) {
        if (typeof plaintext === 'object') {
            plaintext = JSON.stringify(plaintext);
        }
        let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(plaintext), CryptoJS.enc.Utf8.parse(key), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    },

    decrypt: function (ciphertext, key) {
        let decrypted = CryptoJS.AES.decrypt(ciphertext, CryptoJS.enc.Utf8.parse(key), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let decString = CryptoJS.enc.Utf8.stringify(decrypted);
        try {
            return JSON.parse(decString);
        } catch (e) {
            return decString;
        }
    }
};

router.post('/encrypt', (req, res) => {
    let ciphertext = aesUtil.encrypt(req.body.plaintext, process.env.KEY);
    res.send({ ciphertext: ciphertext });
});

router.post('/decrypt', (req, res) => {
    let plaintext = aesUtil.decrypt(req.body.ciphertext, process.env.KEY);
    res.send(plaintext);
});

module.exports = router;