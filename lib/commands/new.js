const {
    existsSync,
    lstatSync,
    unlinkSync,
    rmdirSync
} = require('fs');
const readlineSync = require('readline-sync');
const ora = require('ora');
const path = require("path");
const executeShellCommand = require('../utils/executeShellCommandLine');
const { glob } = require('glob');
const replaceStringToFile = require('../utils/replaceStringToFile');
const executeMultipleShellCommand = require('../utils/executeMultipleShellCommand');
const { exit } = require('process');
const del = require('del');
const gitclone = require('../utils/gitclone');

function _new(options) {
    return new Promise((resolve, reject) => {
        const projectName = options.argv.projectName || readlineSync.question("Which project name? $> ");
        const devices = ['Browser', 'Mobile'];
        const devicesGithubRepositories = ["https://github.com/jguyet/jiji-start-browser.git", ""];
        const deviceIndex = (options.argv.device ? devices.indexOf(options.argv.device) : readlineSync.keyInSelect(devices, 'Which platform?'));

        if (deviceIndex == -1) {
            resolve(`Please select a device.`);
            return;
        }
        const device = devices[deviceIndex];
        const githubRepository = devicesGithubRepositories[deviceIndex];
        const projectPath = path.resolve(options.targetPwd, projectName);

        if (device == 'Mobile') {
            resolve(`Device Mobile is in work in progress.\nPlease check the features often.`);
            return;
        }
        if (existsSync(projectPath)) {
            resolve(`${projectPath}: File exists`);
            return;
        }
        const spinnerGit = ora('Clone starter kit').start();
        const exeCmds = [
            {
                cmd: (success, failure) => {
                    gitclone(githubRepository, projectPath, null, (e) => {
                        if (e !== undefined) {
                            console.log('clone error', e); failure(); exit(1); 
                        }
                        success();
                    });
                }
            },
            {
                cond: () => existsSync(`${path.resolve(projectPath, '.git')}`),
                cmd: (success, failure) => {
                    const dirToDelete = path.resolve(projectPath, '.git');
                    try {
                        del.sync(dirToDelete);
                        success();
                    } catch (err) {
                        failure(`Error while deleting ${dirToDelete}.`);
                        exit(1);
                    }
                }
            }
        ];

        executeMultipleShellCommand(exeCmds, 0, executeMultipleShellCommand, () => {
            spinnerGit.succeed("Starter kit downloaded");
            glob.sync(`${projectPath}/**/*`)
            .forEach(filePath => {
                const lstat = lstatSync(filePath);
                if (lstat.isDirectory()) return ;
                console.log(`CREATE ${filePath.replace(path.resolve(projectPath, '..'), '').replace(/^\/+/, '')} (${lstat.size * 8} bytes)`);
                if (!['.js', '.html', '.json', '.md'].includes(path.extname(filePath))) return ;
                replaceStringToFile(filePath, /application\-name/, projectName);
            });
            ora('Packages installed successfully.').succeed();
            const spinnerDep = ora('Install dependencies').start();
            executeShellCommand(`cd "${projectPath}" && npm install`, (stdout) => {
                spinnerDep.succeed("Successfully initialized.");
                resolve(undefined);
            }, (err) => {
                if (err.error) spinnerDep.warn();
                else spinnerDep.succeed("Successfully initialized.");
            }, false);
        });
    });
};

module.exports = _new;