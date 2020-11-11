const {
existsSync
} = require('fs');
const open = require('open');
const path = require("path");
const chokidar = require('chokidar');
const randomString = require('../utils/randomString');
const executeMultipleShellCommand = require('../utils/executeMultipleShellCommand');
const mountBuildCmds = require('../mountBuildCmds');

function debug(options) {
    return new Promise((resolve, reject) => {
        const dirPath = options.targetPwd;
        const mainPath = path.resolve(dirPath, options.config.main);
        const mainDirPath = path.dirname(mainPath);
        const debugPath = path.resolve(require('os').tmpdir(), `${randomString(32)}.tmp`);
        const generatedMainJsFilename = 'index.js';
        const generatedStyleCssFilename = 'style.css';

        console.log(`Prepare before starting debug server`);
        const exeCmds = mountBuildCmds(dirPath, mainPath, mainDirPath, debugPath, generatedMainJsFilename, generatedStyleCssFilename, { minify: true });
        const runServer = (callback) => {
            const express = require('express')
            const app = express()
            const port = options.argv.p || 8080;

            /** watch debug folder and notify express */
            const livereload = require("livereload");
            const liveReloadServer = livereload.createServer();
            liveReloadServer.watch(debugPath);
            const connectLivereload = require("connect-livereload");
            app.use(connectLivereload());

            var rewriter = function (req, res, next) {
              if (existsSync(debugPath + req.url)) {
                  next();
                  return;
              }
              req.url = "/index.html";
              next();
            };

            app.use(rewriter);

            app.use(express.static(debugPath));
            app.listen(port, () => {
                console.log(`----------------------------------------`);
                console.log(`App listening at http://localhost:${port}`)
                if (options.argv.open) {
                    open(`http://localhost:${port}`);
                }
                callback();
            });
            process.on('SIGINT', function() {
                process.exit();
            });
        }

        const watch = (eventCallback) => {
            const watchFolder = chokidar.watch(dirPath, {
                ignored: /\.\.|node\_modules|\/\./,
            });
            let time = new Date().getTime();
            watchFolder.on('all', (event, path) => {
                if (!['add', 'addDir'].includes(event)) console.log(event, path);
                if (time + 1000 < new Date().getTime()) {
                    eventCallback();
                }
            });
        }

        executeMultipleShellCommand(exeCmds, 0, executeMultipleShellCommand, () => {
            runServer(() => {
                console.log("Start watch folding.")
                watch(() => {
                  executeMultipleShellCommand(exeCmds.slice(2), 0, executeMultipleShellCommand, () => {}); // without creating .debug directory
                });
            });
        })

    });
}

module.exports = debug;