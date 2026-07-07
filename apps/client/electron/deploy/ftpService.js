const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '/.env'),
});

async function publishToCustomServer() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
    });

    try {
      await client.uploadFrom(__dirname + '/../out/MyShip-latest-mac-x64.dmg', '/MyShip-latest-mac-x64.dmg');
    } catch (e) {
      console.log('Die Datei MyShip-latest-mac-x64.dmg konnte nicht hochgeladen werden.');
    }

    try {
      await client.uploadFrom(__dirname + '/../out/MyShip-latest-mac-arm64.dmg', '/MyShip-latest-mac-arm64.dmg');
    } catch (e) {
      console.log('Die Datei MyShip-latest-mac-arm64.dmg konnte nicht hochgeladen werden.');
    }

    console.log('Upload completed successfully');
  } catch (error) {
    console.error('FTP upload error:', error);
  } finally {
    client.close();
  }
}

module.exports = { publishToCustomServer };
