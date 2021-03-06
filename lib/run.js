const {
    readFile
} = require('fs');

function run(argv, fn) {
  const command = argv.command;

  processCommand(command, {
      argv,
      cliPwd: require.main.filename,
      targetPwd: (argv.path ? argv.path : process.cwd())
  }, err => {
      if (err) console.error(err);
      fn(err ? 1 : 0);
  });
};

function doLoadConfig(pwd) {
  const future = new Promise((resolve, reject) => {

      readFile(pwd, (err, result) => {
          if (err) {
              resolve(undefined, err);
          } else resolve(JSON.parse(result.toString()), undefined)
      })
  });
  return future;
};

function processCommand(command, env, fn) {
  doLoadConfig(env.argv.config ? env.argv.config : `${env.targetPwd}/jiconfig.json`)
      .then((config, err) => {
          if (config == undefined && ['debug', 'build', 'g', 'generate'].includes(command)) {
              fn(`Command ${command} need jiconfig.json`);
              return;
          }
          const commands = {
              debug: require("./commands/debug"),
              build: require("./commands/build"),
              new: require("./commands/new"),
              generate: require("./commands/generate/generate"),
              g: require("./commands/generate/generate")
          };

          if (commands[command] === undefined) {
              fn(`Command ${command} not found.`);
              return;
          }

          commands[command]({ command, config: { ... { tabulation: 4 }, ... config }, ...env })
              .then(result => fn(result))
              .catch(error => fn(error))
      })
};

module.exports = run;