const { readFile, readFileSync, existsSync, writeFileSync, mkdirSync } = require('fs');
const { exec } = require("child_process");
const { exit } = require('process');
const open = require('open');
const readlineSync = require('readline-sync');
const ora = require('ora');

module.exports = run;

function run(argv, fn) {
  const command = argv.r;

  processCommand(command, { argv, pwd: process.cwd(), commonOptions: {} }, err => {
    if (err) console.error(err);
    fn(err ? 1 : 0);
  });
}

function executeShellCommand(commandline, fn, fnError = () => { exit(0); }, stdError = true) {
  exec(commandline, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      fnError({ error });
      return;
    }
    if (stderr) {
      if (stdError) console.error(`stderr: ${stderr}`);
      fnError({ stderr });
      return;
    }
    fn(stdout);
  });
}

function createDirectoryIfNotExistsRecursive(dirname) {
  var slash = '/';

  // backward slashes for windows
  if(require('os').platform() === 'win32') {
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
  for(const d in directories_backwards) {
    if(!(existsSync(directories_backwards[d]))) {
        directories_needed.push(directories_backwards[d]);
    } else {
        break;
    }
  }

  //no directories missing
  if(!directories_needed.length) {
    return ;
  }

  // make all directories in ascending order
  var directories_forwards = directories_needed.reverse();

  for(const d in directories_forwards) {
    mkdirSync(directories_forwards[d]);
  }
}

function processCommand(command, { argv, pwd, commonOptions }, fn) {

  function doLoadConfig(pwd) {
    const future = new Promise((resolve, reject) => {

      readFile(`${pwd}/jiconfig.json`, (err, result) => {
        if (err) { resolve(undefined, err); }
        else resolve(JSON.parse(result.toString()), undefined)
      })
    });
    return future;
  }

  doLoadConfig(pwd)
    .then((config, err) => {

      if (config == undefined && ['serve', 'build'].includes(command)) {
        fn(`Command ${command} need jiconfig.json`);
        return ;
      }

      const commands = {
          serve: (options) => {
            return new Promise((resolve, reject) => {
              const path = require("path");
              const mainPath = path.resolve(options.pwd, options.config.main);
              const dirPath = path.dirname(mainPath);
              const debugPath = path.resolve(dirPath, ".debug");
              const browserifyPath = path.resolve(dirPath, "node_modules/browserify/bin/cmd.js");

              if (!debugPath.includes(dirPath)) {
                exit(0);
              }

              console.log(options.pwd);

              console.log(`Start build before starting debug server`);
              executeShellCommand(`rm -rf "${debugPath}"; mkdir "${debugPath}" ; node "${browserifyPath}" ${mainPath} > "${debugPath}/index.js" ; cp "${dirPath}/index.html" "${debugPath}/index.html"; cp "${dirPath}/style.css" "${buildPath}/style.css"`, (stdout) => {
                console.log(`----------------------------------------`);
                const express = require('express')
                const app = express()
                const port = 8080;
                app.use(express.static(debugPath));
                app.listen(port, () => {
                  console.log(`App listening at http://localhost:${port}`)
                  if (argv.open) { open(`http://localhost:${port}`); }
                });
                process.on('SIGINT', function() {
                  executeShellCommand(`rm -rf "${debugPath}"`, () => {
                    process.exit();
                  });
                });
              });

            });
          },
          build: (options) => {
            return new Promise((resolve, reject) => {
              const path = require("path");
              const mainPath = path.resolve(options.pwd, options.config.main);
              const dirPath = path.dirname(mainPath);
              const buildPath = path.resolve(dirPath, "dist");
              const browserifyPath = path.resolve(dirPath, "node_modules/browserify/bin/cmd.js");
              const minifyPath = path.resolve(dirPath, "node_modules/minify/bin/minify.js");

              if (!buildPath.includes(dirPath)) {
                exit(0);
              }

              console.log(`Start build`);
              executeShellCommand(`rm -rf "${buildPath}"; mkdir "${buildPath}" ; node "${browserifyPath}" "${mainPath}" > "${buildPath}/index.js"; node "${minifyPath}" "${buildPath}/index.js" > "${buildPath}/index-min.js"; mv "${buildPath}/index-min.js" "${buildPath}/index.js" ; cp "${dirPath}/index.html" "${buildPath}/index.html"; cp "${dirPath}/style.css" "${buildPath}/style.css"`, (stdout) => {
                console.log(`----------------------------------------`);
                console.log(`Build Finished.`);
                resolve(undefined);
              });
            });
          },
          init: (options) => {
            return new Promise((resolve, reject) => {
              const path = require("path");

              const projectName = readlineSync.question("What name do you want for the new workspace and the initial project? $> ");
              const projectPath = path.resolve(options.pwd, projectName);

              if (existsSync(projectPath)) {
                resolve(`${projectPath}: File exists`);
                return ;
              }
              executeShellCommand(`mkdir "${projectPath}"`, (stdout) => {
                console.log(stdout);

                const cliPath = path.resolve(require.main.filename, '../../');

                const files = {
                  "package.json": readFileSync(path.resolve(cliPath, "lib/base/package.json")).toString().replace("$projectName", projectName),
                  "jiconfig.json": readFileSync(path.resolve(cliPath, "lib/base/jiconfig.json")).toString(),
                  "index.html": readFileSync(path.resolve(cliPath, "lib/base/index.html")).toString(),
                  "style.css": readFileSync(path.resolve(cliPath, "lib/base/style.css")).toString(),
                  "main.js": readFileSync(path.resolve(cliPath, "lib/base/main.js")).toString(),
                  "src/page1.js": readFileSync(path.resolve(cliPath, "lib/base/src/page1.js")).toString(),
                  "src/page2.js": readFileSync(path.resolve(cliPath, "lib/base/src/page2.js")).toString()
                };

                Object.keys(files).forEach(filePath => {
                  console.log(`CREATE ${path.resolve(projectName, filePath)} (${files[filePath].length * 8} bytes)`);
                  createDirectoryIfNotExistsRecursive(path.dirname(path.resolve(projectPath, filePath)))
                  writeFileSync(path.resolve(projectPath, filePath), files[filePath])
                });
                ora('Packages installed successfully.').succeed();

                const spinnerDep = ora('Install dependencies').start();
                executeShellCommand(`cd "${projectPath}" && npm install`, (stdout) => {
                  spinnerDep.succeed("Successfully initialized.");
                  resolve(undefined);
                }, (err) => { if (err.error) spinnerDep.warn(); else spinnerDep.succeed("Successfully initialized."); }, false);
              });
            });
          }
      };

      if (commands[command] === undefined) {
        fn(`Command ${command} not found.`);
        return ;
      }

      commands[command]({ command, pwd, config, commonOptions }).then(result =>
        fn(result)
      )
  })
}