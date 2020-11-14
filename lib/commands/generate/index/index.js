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

function index(options) {
    return new Promise((resolve, reject) => {
        if (options.argv._.length < 3) {
            console.log("Generate Index name not found.");
            resolve(undefined);
            return ;
        }
        const name = options.argv._[2];
        const dirPath = options.targetPwd;
        const mainPath = path.resolve(dirPath, options.config.main);
        const mainDirPath = path.dirname(mainPath);
        const sepCaseIndexName = sepCase(path.basename(name));
        const indexDirectory = path.resolve(mainDirPath, path.dirname(name), sepCaseIndexName);

        if (!path.normalize(indexDirectory).includes(mainDirPath)) {
            console.log("Generate Index is out of project.");
            resolve(undefined);
            return ;
        }

        const exeCmds = [
            {
                cmd: (success, failure) => {
                    createDirectoryIfNotExistsRecursive(indexDirectory);
                    success();
                }
            },
            {
                cond: () => !existsSync(path.resolve(indexDirectory, `${sepCaseIndexName}.index.js`)),
                cmd: (success, failure) => {
                    var templateIndexJs = readFileSync(path.resolve(require.main.filename, "../../", "lib/commands/generate/template.index.js")).toString()
                        .replace(/    /gm, tab(1, options.tabulation))
                        .replace(/\n/gm, endOfLine);

                    writeFileSync(path.resolve(indexDirectory, `${sepCaseIndexName}.index.js`), templateIndexJs, 'utf8');
                    success();
                },
                success: () => {
                    console.log(`CREATE Index ${path.resolve(indexDirectory, `${sepCaseIndexName}.index.js`)}`);
                }
            },
            {
                cmd: (success, failure) => {// watch left folders of index and update first routing map with new index information
                    let leftDirectory = path.resolve(indexDirectory, '..');
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
                                    replaceWord: `Jiji.Router.initialize([${endOfLine}\$tabulation{ path: "/${sepCaseIndexName}", index: () => require("./$indexRelativePathWithoutExtension") }`
                                },
                                { // index
                                    match: /(?:module\.exports\s*\=\s*\[[\n\r\f\v]*)([^]*?)(?:\s*\]\;)/,
                                    replaceMatch: /module\.exports\s*\=\s*\[/,
                                    replaceWord: `module.exports = [${endOfLine}\$tabulation{ path: "/${sepCaseIndexName}", index: index: () => require("./$indexRelativePathWithoutExtension") }`
                                }
                            ]
                            .filter(pattern => index.match(pattern.match) != undefined)
                            .forEach(pattern => {
                                const match = index.match(pattern.match);

                                if (match[1].includes(`${sepCaseIndexName}.index`)) { // already defined
                                    stop = true;
                                    return ;
                                }
                                let controllersInModule = match[1].split("\n").filter(x => x.trim() != "");
                                let numberOfSpace = controllersInModule.length > 0 ? controllersInModule[0].length - controllersInModule[0].trimLeft().length : 0;

                                const indexRelativePathWithoutExtension = path.relative(leftDirectory, path.resolve(indexDirectory, `${sepCaseIndexName}.index`));
                                const replaceWord = pattern.replaceWord
                                    .replace(/\$tabulation/, tab(numberOfSpace, 1))
                                    .replace(/\$indexRelativePathWithoutExtension/, indexRelativePathWithoutExtension);
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
            console.log(`Index ${sepCaseIndexName} CREATED`);
            resolve(undefined);
        });
    });
};

module.exports = index;