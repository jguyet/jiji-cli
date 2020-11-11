const executeShellCommand = require('./executeShellCommandLine');

function executeMultipleShellCommand(exeCmds, i, next, callback) {
    if (i >= exeCmds.length) {
        callback();
        return;
    }
    if (exeCmds[i].cond !== undefined && !exeCmds[i].cond()) {
      if (exeCmds[i].skipped !== undefined) exeCmds[i].skipped();
      next(exeCmds, i += 1, next, callback);
      return ;
    }
    if (typeof exeCmds[i].cmd === 'string') {
      executeShellCommand(exeCmds[i].cmd, (stdout) => {
          if (exeCmds[i].success !== undefined) exeCmds[i].success(stdout);
          next(exeCmds, i += 1, next, callback);
      }, (error) => {
          if (exeCmds[i].error !== undefined) exeCmds[i].error(error);
          next(exeCmds, i += 1, next, callback);
      }, false, () => {});
    } else if (typeof exeCmds[i].cmd === 'function') {
      exeCmds[i].cmd(
          (stdout) => { if (exeCmds[i].success !== undefined) exeCmds[i].success(stdout); next(exeCmds, i += 1, next, callback); }, // success
          (error) => { if (exeCmds[i].error !== undefined) exeCmds[i].error(error); next(exeCmds, i += 1, next, callback); } // failure
      );
    } else {// next
      next(exeCmds, i += 1, next, callback);
    }
}

module.exports = executeMultipleShellCommand;