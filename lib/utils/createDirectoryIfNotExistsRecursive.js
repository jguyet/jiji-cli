const {
    existsSync,
    mkdirSync
} = require('fs');

function createDirectoryIfNotExistsRecursive(dirname) {
    var slash = '/';

    // backward slashes for windows
    if (require('os').platform() === 'win32') {
        slash = '\\';
    }
    // initialize directories with final directory
    var directories_backwards = [dirname];
    var minimize_dir = dirname;
    while (minimize_dir = minimize_dir.substring(0, minimize_dir.lastIndexOf(slash))) {
        directories_backwards.push(minimize_dir);
    }

    var directories_needed = [];

    //stop on first directory found
    for (const d in directories_backwards) {
        if (!(existsSync(directories_backwards[d]))) {
            directories_needed.push(directories_backwards[d]);
        } else {
            break;
        }
    }

    //no directories missing
    if (!directories_needed.length) {
        return;
    }

    // make all directories in ascending order
    var directories_forwards = directories_needed.reverse();

    for (const d in directories_forwards) {
        mkdirSync(directories_forwards[d]);
    }
}

module.exports = createDirectoryIfNotExistsRecursive;