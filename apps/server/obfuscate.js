const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require("fs");
const path = require("path");

const readFilesRecursively = (directory) => {
    const files = fs.readdirSync(directory); // Alle Dateien im aktuellen Verzeichnis lesen
    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            readFilesRecursively(filePath); // Wenn es ein Verzeichnis ist, rekursiv aufrufen
        } else if (filePath.toLowerCase().endsWith('.js')) {
            console.log('Bearbeite Datei:', filePath);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const obfuscationResult = JavaScriptObfuscator.obfuscate(fileContent);
            fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
        }
    });
}

readFilesRecursively('./dist');