const {
    existsSync,
    lstatSync,
    unlinkSync,
    rmdirSync,
    writeFileSync
} = require('fs');
const path = require('path');
const executeMultipleShellCommand = require("../utils/executeMultipleShellCommand");
const createDirectoryIfNotExistsRecursive = require("../utils/createDirectoryIfNotExistsRecursive");
const replaceStringToFile = require("../utils/replaceStringToFile");

function sepCase(str, sep = '-') {
    return str
      .replace(/[A-Z]/g, (letter, index) => {
        const lcLet = letter.toLowerCase();
        return index ? sep + lcLet : lcLet;
      })
      .replace(/([-_ ]){1,}/g, sep)
}

function tab(n, tabValue = 4) {
    return Array(n).fill().map(x => Array(tabValue).fill().map(x => ' ').join()).join();
}

function generate(options) {
    return new Promise((fresolve, freject) => {
        if (options.argv._.length < 2) {
            console.log("Generate Type not found.");
            fresolve(undefined);
            return ;
        }
        const t = options.argv._[1];

        const types = {
            controller: function(options) {
                return new Promise((resolve, reject) => {
                    if (options.argv._.length < 3) {
                        console.log("Generate Controller name not found.");
                        resolve(undefined);
                        return ;
                    }
                    const name = options.argv._[2];
                    const dirPath = options.targetPwd;
                    const mainPath = path.resolve(dirPath, options.config.main);
                    const mainDirPath = path.dirname(mainPath);
                    
                    const sepCaseControllerName = sepCase(path.basename(name));
                    const controllerDirectory = path.resolve(mainDirPath, path.dirname(name), sepCaseControllerName);

                    if (!path.normalize(controllerDirectory).includes(mainDirPath)) {
                        console.log("Generate Controller is out of project.");
                        resolve(undefined);
                        return ;
                    }

                    if (existsSync(controllerDirectory)) {
                        console.log(`Generate Controller ${path.dirname(name)} already exists`);
                        resolve(undefined);
                        return ;
                    }
                    
                    const exeCmds = [
                        {
                            cmd: (success, failure) => {
                                createDirectoryIfNotExistsRecursive(controllerDirectory);
                                writeFileSync(path.resolve(controllerDirectory, `${sepCaseControllerName}.controller.js`),
`const Jiji = require("jiji-js");

module.exports = {
    title: "${sepCaseControllerName}",
    constructor: function (callback) {
        console.log("construct");
        callback();
    },
    mounted: function () {
        console.log("mounted");
    },
    destroy: function () {
        console.log("destroy");
    },
    innerHTML: require("./${sepCaseControllerName}.html")
};
`, 'utf8');
console.log(`CREATE ${path.resolve(controllerDirectory, `${sepCaseControllerName}.controller.js`)}`);
                                writeFileSync(path.resolve(controllerDirectory, `${sepCaseControllerName}.html.js`),
`module.exports = /* html */\`
<div class="page-container"></div>
\`;
`, 'utf8');
console.log(`CREATE ${path.resolve(controllerDirectory, `${sepCaseControllerName}.html.js`)}`);
success();
                            }
                        },
                        {
                            cmd: (success, failure) => {
                                const controllerRelativePathWithoutExtension = path.relative(mainDirPath, path.resolve(controllerDirectory, `${sepCaseControllerName}.controller`));
                                replaceStringToFile(mainPath, /Jiji\.Router\.initialize\(\[/, `Jiji.Router.initialize([\n        { path: "${sepCaseControllerName}", controller: require("${controllerRelativePathWithoutExtension}") },`);
                                success();
                            }
                        }
                    ];

                    executeMultipleShellCommand(exeCmds, 0, executeMultipleShellCommand, () => {
                        console.log(`Controller ${sepCaseControllerName} CREATED`);
                        resolve(undefined);
                    });
                });
            }
        };

        if (types[t] === undefined) {
            fresolve(`Generate Type ${t} not found.`);
            return;
        }

        types[t]({ type: t, ... options })
            .then(result => fresolve(result))
            .catch(error => freject(error))
    });
};

module.exports = generate;