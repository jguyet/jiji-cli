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
const Git = require("nodegit");
const { exit } = require('process');

function _new(options) {
    return new Promise((resolve, reject) => {
        const projectName = options.projectName || readlineSync.question("Which project name? $> ");
        const devices = ['Browser', 'Mobile'];
        const devicesGithubRepositories = ["https://github.com/jguyet/jiji-start.git", ""];
        const deviceIndex = (options.device ? devices.indexOf(options.device) : readlineSync.keyInSelect(devices, 'Which platform?'));

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
                    Git.Clone(githubRepository, projectPath).then(function(repository) {
                        success();
                    }).catch((e) => { console.log('clone error', e); failure(); exit(1); });
                }
            },
            {
                cond: () => existsSync(`${path.resolve(projectPath, '.git')}`),
                cmd: (success, failure) => { try { rmdirSync(path.resolve(projectPath, '.git')); success(); } catch(e) { console.log(e); failure(e); } }
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