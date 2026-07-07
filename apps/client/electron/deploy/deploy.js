const ftpService = require('./ftpService');
const versionCountUp = require('./versionService');

versionCountUp();

ftpService.publishToCustomServer().then(() => {
  console.log('Skript beendet.');
});
