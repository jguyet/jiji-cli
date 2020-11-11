var fs = require('fs')

function replaceStringToFile(someFile, search, replacement) {
    const data = fs.readFileSync(someFile, 'utf8').toString();
    const result = data.replace(search, replacement);

    if (data != result) fs.writeFileSync(someFile, result, 'utf8');
};

module.exports = replaceStringToFile;