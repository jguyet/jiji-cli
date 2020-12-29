const ora = require('ora');
const path = require("path");
const randomString = require('../utils/randomString');
const executeMultipleShellCommand = require('../utils/executeMultipleShellCommand');
const mountBuildCmds = require('../mountBuildCmds');

function build(options) {
    return new Promise((resolve, reject) => {
        const isModile = options.config.device === "mobile";
        const dirPath = options.targetPwd;
        const mainPath = path.resolve(options.targetPwd, options.config.main);
        const mainDirPath = path.dirname(mainPath);
        const buildPath = path.resolve(dirPath, isModile ? "www" : "dist");
        const generatedMainJsFilename = `${randomString(32)}.js`;
        const generatedStyleCssFilename = `${randomString(32)}.css`;

        if (!buildPath.includes(dirPath)) {//check is good directory
            exit(0);
        }
        console.log(`Start build`);
        const exeCmds = mountBuildCmds(dirPath, mainPath, mainDirPath, buildPath, generatedMainJsFilename, generatedStyleCssFilename, {
            minify: isModile ? false : true,
            htaccess: isModile ? false : true
        });
        executeMultipleShellCommand(exeCmds, 0, executeMultipleShellCommand, () => {
            ora("Build Successfully finished.").succeed();
            resolve(undefined);
        });
    });
};

module.exports = build;