const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

const envPath = path.resolve(__dirname, '.env');

let envConfig = {};
try {
    envConfig = dotenv.parse(fs.readFileSync(envPath));
} catch (e) {
    console.error('.env file not found');
    process.exit(1);
}

const newKey = crypto.randomBytes(1024).toString('base64').slice(0, 1024);

envConfig.KEY = newKey;

const envString = Object.keys(envConfig).map(key => `${key}=${envConfig[key]}`).join('\n');
fs.writeFileSync(envPath, envString);

console.log('.env file updated successfully');
