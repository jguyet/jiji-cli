const fs = require("fs");
const path = require("path");


function copyFolderSync(from, to) {
    try {
      fs.mkdirSync(to);
    } catch(e) {}
  
    fs.readdirSync(from).forEach((element) => {
      const stat = fs.lstatSync(path.join(from, element));
      if (stat.isFile()) {
        fs.copyFileSync(path.join(from, element), path.join(to, element));
      } else if (stat.isSymbolicLink()) {
        fs.symlinkSync(fs.readlinkSync(path.join(from, element)), path.join(to, element));
      } else if (stat.isDirectory()) {
        copyFolderSync(path.join(from, element), path.join(to, element));
      }
    });
}

copyFolderSync("./lib", "./toto");