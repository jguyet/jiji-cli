const {
    exec
} = require("child_process");
const {
    exit
} = require('process');

function executeShellCommand(commandline, fn, fnError = () => {
    exit(0);
}, stdError = true, logger = console.error) {
    exec(commandline, (error, stdout, stderr) => {
        if (error) {
            logger(`error: ${error.message}`);
            fnError(error);
            return;
        }
        if (stderr && stdError) {
            logger(`stderr: ${stderr}`);
            fnError(stderr);
            return;
        }
        fn(stdout);
    });
}

module.exports = executeShellCommand;