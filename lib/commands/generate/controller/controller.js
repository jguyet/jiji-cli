
const {
    existsSync,
    lstatSync,
    writeFileSync,
    readFileSync
} = require('fs');
const path = require('path');
const executeMultipleShellCommand = require("../../../utils/executeMultipleShellCommand");
const createDirectoryIfNotExistsRecursive = require("../../../utils/createDirectoryIfNotExistsRecursive");
const replaceStringToFile = require("../../../utils/replaceStringToFile");
const { glob } = require('glob');
const tab = require('../../../utils/tab');
const sepCase = require('../../../utils/sepCase');
const endOfLine = require('os').EOL;

function controller(options) {
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

        const exeCmds = [
            {
                cmd: (success, failure) => {
                    createDirectoryIfNotExistsRecursive(controllerDirectory);
                    success();
                }
            },
            {
                cond: () => !existsSync(path.resolve(controllerDirectory, `${sepCaseControllerName}.controller.js`)),
                cmd: (success, failure) => {
                    var templateControllerJs = readFileSync(path.resolve(require.main.filename, "../../", "lib/commands/generate/template.controller.js")).toString()
                        .replace(/\$sepCaseControllerName/gm, sepCaseControllerName)
                        .replace(/    /gm, tab(1, options.tabulation))
                        .replace(/\n/gm, endOfLine);

                    writeFileSync(path.resolve(controllerDirectory, `${sepCaseControllerName}.controller.js`), templateControllerJs, 'utf8');
                    success();
                },
                success: () => {
                    console.log(`CREATE Controller ${path.resolve(controllerDirectory, `${sepCaseControllerName}.controller.js`)}`);
                }
            },
            {
                cond: () => !existsSync(path.resolve(controllerDirectory, `${sepCaseControllerName}.html.js`)),
                cmd: (success, failure) => {
                    var templateControllerHtml = readFileSync(path.resolve(require.main.filename, "../../", "lib/commands/generate/template.html.js")).toString()
                        .replace(/\n/gm, endOfLine);

                    writeFileSync(path.resolve(controllerDirectory, `${sepCaseControllerName}.html.js`), templateControllerHtml, 'utf8');
                    success();
                },
                success: () => {
                    console.log(`CREATE View ${path.resolve(controllerDirectory, `${sepCaseControllerName}.html.js`)}`);
                }
            },
            {
                cmd: (success, failure) => {// watch left folders of controller and update first routing map with new controller information
                    let leftDirectory = controllerDirectory;
                    let stop = false;

                    while (!stop && path.normalize(leftDirectory) != path.normalize(dirPath)) {
                        glob.sync(`${leftDirectory}/*`)
                        .forEach(indexPath => {
                            if (stop) return ;
                            if (lstatSync(indexPath).isDirectory()) return ;
                            if (!indexPath.endsWith('index.js')) return ;
                            const index = readFileSync(indexPath).toString();

                            [
                                { // main index
                                    match: /(?:Jiji\.Router\.initialize\(\[[\n\r\f\v]*)([^]*?)(?:\s*\]\)\;)/,
                                    replaceMatch: /Jiji\.Router\.initialize\(\[/,
                                    replaceWord: `Jiji.Router.initialize([${endOfLine}\$tabulation{ path: "/${sepCaseControllerName}", controller: require("./$controllerRelativePathWithoutExtension") }`
                                },
                                { // index
                                    match: /(?:module\.exports\s*\=\s*\[[\n\r\f\v]*)([^]*?)(?:\s*\]\;)/,
                                    replaceMatch: /module\.exports\s*\=\s*\[/,
                                    replaceWord: `module.exports = [${endOfLine}\$tabulation{ path: "/${sepCaseControllerName}", controller: require("./$controllerRelativePathWithoutExtension") }`
                                }
                            ]
                            .filter(pattern => index.match(pattern.match) != undefined)
                            .forEach(pattern => {
                                const match = index.match(pattern.match);
                                if (match[1].includes(`${sepCaseControllerName}.controller`)) { // already defined
                                    stop = true;
                                    return ;
                                }
                                let controllersInModule = match[1].split("\n").filter(x => x.trim() != "");
                                let numberOfSpace = controllersInModule.length > 0 ? controllersInModule[0].length - controllersInModule[0].trimLeft().length : options.config.tabulation;

                                const controllerRelativePathWithoutExtension = path.relative(leftDirectory, path.resolve(controllerDirectory, `${sepCaseControllerName}.controller`));
                                const replaceWord = pattern.replaceWord
                                    .replace(/\$tabulation/, tab(numberOfSpace, 1))
                                    .replace(/\$controllerRelativePathWithoutExtension/, controllerRelativePathWithoutExtension);
                                replaceStringToFile(indexPath, pattern.replaceMatch, replaceWord + (controllersInModule.length > 0 ? ',' : ''));
                                stop = true;
                                console.log(`UPDATE Index ${indexPath}`);
                            })
                        });
                        leftDirectory = path.resolve(leftDirectory, '..');
                    }
                    success();
                }
            }
        ];

        executeMultipleShellCommand(exeCmds, 0, executeMultipleShellCommand, () => {
            console.log(`Controller ${sepCaseControllerName} CREATED`);
            resolve(undefined);
        });
    });
};

module.exports = controller;