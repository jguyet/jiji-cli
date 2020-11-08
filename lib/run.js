const {
  readFile,
  readFileSync,
  existsSync,
  writeFileSync
} = require('fs');
const {
  exit
} = require('process');
const open = require('open');
const readlineSync = require('readline-sync');
const ora = require('ora');
const path = require("path");
const chokidar = require('chokidar');
const executeShellCommand = require('./utils/executeShellCommandLine');
const createDirectoryIfNotExistsRecursive = require('./utils/createDirectoryIfNotExistsRecusive');

module.exports = run;

function run(argv, fn) {
  const command = argv.command;

  processCommand(command, {
      argv,
      cliPwd: require.main.filename,
      targetPwd: process.cwd()
  }, err => {
      if (err) console.error(err);
      fn(err ? 1 : 0);
  });
}

function doLoadConfig(pwd) {
  const future = new Promise((resolve, reject) => {

      readFile(`${pwd}/jiconfig.json`, (err, result) => {
          if (err) {
              resolve(undefined, err);
          } else resolve(JSON.parse(result.toString()), undefined)
      })
  });
  return future;
}

function processCommand(command, env, fn) {
  doLoadConfig(env.targetPwd)
      .then((config, err) => {

          if (config == undefined && ['debug', 'build'].includes(command)) {
              fn(`Command ${command} need jiconfig.json`);
              return;
          }

          const commands = {
              debug: (options) => {
                  return new Promise((resolve, reject) => {
                      const mainPath = path.resolve(options.targetPwd, options.config.main);
                      const dirPath = path.dirname(mainPath);
                      const debugPath = path.resolve(dirPath, ".debug");
                      const browserifyPath = path.resolve(dirPath, "node_modules/browserify/bin/cmd.js");

                      if (!debugPath.includes(dirPath)) {
                          exit(0);
                      }

                      console.log(`Prepare before starting debug server`);
                      const exeCmds = [{
                              cmd: `rm -rf "${debugPath}"`,
                              success: () => {},
                              error: () => {}
                          },
                          {
                              cmd: `mkdir "${debugPath}"`,
                              success: () => {},
                              error: () => {}
                          },
                          {
                              cmd: `node "${browserifyPath}" "${mainPath}" > "${debugPath}/index.js"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).fail(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                              }
                          },
                          {
                              cmd: `cp "${dirPath}/index.html" "${debugPath}/index.html"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                              }
                          },
                          {
                              cmd: `cp "${dirPath}/style.css" "${debugPath}/style.css"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                              }
                          },
                          {
                            cmd: `cp "${debugPath}/index.html" "${debugPath}/../index-test.html"`,
                            success: () => {},
                            error: (error) => {
                                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                            }
                        },
                      ];

                      const flattenPromise = (exeCmds, i, next, callback) => {
                          if (i >= exeCmds.length) {
                              callback();
                              return;
                          }
                          executeShellCommand(exeCmds[i].cmd, (stdout) => {
                              exeCmds[i].success(stdout);
                              next(exeCmds, i += 1, next, callback);
                          }, (error) => {
                              exeCmds[i].error(error);
                              next(exeCmds, i += 1, next, callback);
                          }, false, () => {});
                      }

                      const runServer = (callback) => {
                          const express = require('express')
                          const app = express()
                          const port = env.argv.p || 8080;

                          /** watch debug folder and notify express */
                          const livereload = require("livereload");
                          const liveReloadServer = livereload.createServer();
                          liveReloadServer.watch(debugPath);
                          const connectLivereload = require("connect-livereload");
                          app.use(connectLivereload());

                          var rewriter = function (req, res, next) {
                            if (existsSync(process.cwd() + '/.debug' + req.url)) {
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
                              executeShellCommand(`rm -rf "${debugPath}"`, () => {
                                  process.exit();
                              });
                          });
                      }

                      const watch = (eventCallback) => {
                          const watchFolder = chokidar.watch(options.targetPwd, {
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

                      flattenPromise(exeCmds, 0, flattenPromise, () => {
                          runServer(() => {
                              console.log("Start watch folding.")
                              watch(() => {
                                  flattenPromise(exeCmds.slice(2), 0, flattenPromise, () => {}); // without creating .debug directory
                              });
                          });
                      })

                  });
              },
              build: (options) => {
                  return new Promise((resolve, reject) => {
                      const mainPath = path.resolve(options.targetPwd, options.config.main);
                      const dirPath = path.dirname(mainPath);
                      const buildPath = path.resolve(dirPath, "dist");
                      const browserifyPath = path.resolve(dirPath, "node_modules/browserify/bin/cmd.js");
                      const minifyPath = path.resolve(dirPath, "node_modules/minify/bin/minify.js");

                      if (!buildPath.includes(dirPath)) {
                          exit(0);
                      }

                      console.log(`Start build`);
                      const exeCmds = [{
                              cmd: `rm -rf "${buildPath}"`,
                              success: () => {},
                              error: () => {}
                          },
                          {
                              cmd: `mkdir "${buildPath}"`,
                              success: () => {},
                              error: () => {}
                          },
                          {
                              cmd: `cp "${path.resolve(require.main.filename, '../../')}/lib/.htaccess" "${buildPath}/.htaccess"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                              }
                          },
                          {
                              cmd: `node "${browserifyPath}" "${mainPath}" > "${buildPath}/index.js"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).fail(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                                  exit(1);
                              }
                          },
                          {
                              cmd: `node "${minifyPath}" "${buildPath}/index.js" > "${buildPath}/index-min.js"`,
                              success: () => {},
                              error: console.error
                          },
                          {
                              cmd: `mv "${buildPath}/index-min.js" "${buildPath}/index.js"`,
                              success: () => {},
                              error: console.error
                          },
                          {
                              cmd: `cp "${dirPath}/index.html" "${buildPath}/index.html"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                              }
                          },
                          {
                              cmd: `cp "${dirPath}/style.css" "${buildPath}/style.css"`,
                              success: () => {},
                              error: (error) => {
                                  ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
                              }
                          },
                      ];

                      const flattenPromise = (exeCmds, i, next, callback) => {
                          if (i >= exeCmds.length) {
                              callback();
                              return;
                          }
                          executeShellCommand(exeCmds[i].cmd, (stdout) => {
                              exeCmds[i].success(stdout);
                              next(exeCmds, i += 1, next, callback);
                          }, (error) => {
                              exeCmds[i].error(error);
                              next(exeCmds, i += 1, next, callback);
                          }, false, () => {});
                      }
                      flattenPromise(exeCmds, 0, flattenPromise, () => {
                          ora("Build Successfully finished.").succeed();
                          resolve(undefined);
                      });
                  });
              },
              new: (options) => {
                  return new Promise((resolve, reject) => {
                      const projectName = readlineSync.question("What name do you want for the new workspace and the initial project? $> ");
                      const projectPath = path.resolve(options.targetPwd, projectName);

                      if (existsSync(projectPath)) {
                          resolve(`${projectPath}: File exists`);
                          return;
                      }
                      executeShellCommand(`mkdir "${projectPath}"`, (stdout) => {
                          console.log(stdout);

                          const cliPath = path.resolve(require.main.filename, '../../');
                          const readProjectFile = (filePath) => {
                              return readFileSync(path.resolve(cliPath, filePath)).toString();
                          }
                          const files = {
                              "package.json": readProjectFile("lib/base/package.json").replace("$projectName", projectName),
                              "jiconfig.json": readProjectFile("lib/base/jiconfig.json"),
                              "index.html": readProjectFile("lib/base/index.html"),
                              "style.css": readProjectFile("lib/base/style.css"),
                              "main.js": readProjectFile("lib/base/main.js"),
                              "src/page1.js": readProjectFile("lib/base/src/page1.js"),
                              "src/page2.js": readProjectFile("lib/base/src/page2.js")
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
                          }, (err) => {
                              if (err.error) spinnerDep.warn();
                              else spinnerDep.succeed("Successfully initialized.");
                          }, false);
                      });
                  });
              }
          };

          if (commands[command] === undefined) {
              fn(`Command ${command} not found.`);
              return;
          }

          commands[command]({
                  command,
                  config,
                  ...env
              })
              .then(result => fn(result))
              .catch(error => fn(error))
      })
}