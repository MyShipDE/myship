const fs = require('fs');
const path = require('path');

const incrementOwnPackageVersion = (increment) => {
  try {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = require(packageJsonPath);

    switch (increment) {
      case 'patch':
        packageJson.version = incrementVersion(packageJson.version, 'patch');
        break;
      case 'minor':
        packageJson.version = incrementVersion(packageJson.version, 'minor');
        break;
      case 'major':
        packageJson.version = incrementVersion(packageJson.version, 'major');
        break;
      default:
        console.error(`Invalid increment type: ${increment}`);
        return null;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return packageJson.version;
  } catch (error) {
    console.error(`Error incrementing own package version: ${error.message}`);
    return null;
  }
}

const incrementVersion = (currentVersion, increment) => {
  const versionParts = currentVersion.split('.').map(part => parseInt(part));

  switch (increment) {
    case 'patch':
      versionParts[2] += 1;
      break;
    case 'minor':
      versionParts[1] += 1;
      versionParts[2] = 0;
      break;
    case 'major':
      versionParts[0] += 1;
      versionParts[1] = 0;
      versionParts[2] = 0;
      break;
  }

  return versionParts.join('.');
}

module.exports = () => {
  const incrementType = 'patch';
  const newVersion = incrementOwnPackageVersion(incrementType);

  if (newVersion) {
    console.log(`Die Version des Pakets wurde auf: ${newVersion} erhöht.`);
  }
}
