const fs = require('fs');

if (process.argv.length !== 3) {
    console.error('Verwendung: node script.js <Pfad zur .json Datei>');
    process.exit(1);
}

const filePath = process.argv[2];

if (!fs.existsSync(filePath)) {
    const defaultData = { version: 1 };
    process.env.BUILD = defaultData.version;
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
} else {
    try {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        jsonData.version++;
        process.env.BUILD = jsonData.version;
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    } catch (error) {
        console.error(`Fehler beim Lesen oder Schreiben der Datei: ${error.message}`);
        process.exit(1);
    }
}

try {
    const jsonData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    process.env.VERSION = jsonData.version;
} catch (error) {
    console.error(`Fehler beim Lesen oder Schreiben der Datei: ${error.message}`);
    process.exit(1);
}

console.log(`v${process.env.VERSION}.${process.env.BUILD}`);