const {
    mkdirSync,
    readdirSync,
    lstatSync,
    copyFileSync,
    symlinkSync,
    readlinkSync
} = require('fs');
const path = require("path");


function copyFolderSync(from, to) {
    try {
      mkdirSync(to);
    } catch(e) {}
  
    readdirSync(from).forEach((element) => {
      const stat = lstatSync(path.join(from, element));
      if (stat.isFile()) {
        copyFileSync(path.join(from, element), path.join(to, element));
      } else if (stat.isSymbolicLink()) {
        symlinkSync(readlinkSync(path.join(from, element)), path.join(to, element));
      } else if (stat.isDirectory()) {
        copyFolderSync(path.join(from, element), path.join(to, element));
      }
    });
}

module.exports = copyFolderSync;