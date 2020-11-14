const test = require('tap').test;
const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');
const { getStreamChunk } = require('../lib/utils/test.util');
const del = require('del');
const sepCase = require('../lib/utils/sepCase');

if (fs.existsSync(path.resolve(__dirname, '../tap-test'))) {
  try {
    del.sync(path.resolve(__dirname, '../tap-test'));

    console.log(`${path.resolve(__dirname, '../tap-test')} is deleted!`);
  } catch (err) {
      console.error(`Error while deleting ${path.resolve(__dirname, '../tap-test')}.`);
  }
}

const execCommand = (cmds) => {
  let arrayArgs = [
      path.resolve(__dirname, '../bin/ji'),
      ... cmds
  ];
  return spawn(process.execPath, arrayArgs);
};

test('run arguments not found', function (t) {
  t.plan(1);

  let ps = execCommand(['ninja', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!errorStream.chunks.join("\n").includes("Command ninja not found.")) {
      t.fail("run arguments not found");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments --config not exists', function (t) {
  t.plan(1);

  let ps = execCommand(['build', "--config='./toto.json'", `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!errorStream.chunks.join("\n").includes("Command build need jiconfig.json")) {
      t.fail("run arguments --config not exists");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments --port not a number', function (t) {
  t.plan(1);

  let ps = execCommand(['--port=bou']);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!errorStream.chunks.join("\n").includes("--port need number value.")) {
      t.fail("run arguments --port not a number");
    }
    t.equal(code, 0);
    t.end();
  });
});

test('run arguments empty', function (t) {
  t.plan(1);

  let ps = execCommand([]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!errorStream.chunks.join("\n").includes("Please specify a single command.")) {
      t.fail("run arguments empty");
    }
    t.equal(code, 0);
    t.end();
  });
});

test('run arguments --help', function (t) {
    t.plan(1);

    let ps = execCommand(['--help']);
    let errorStream = getStreamChunk();
    let outStream = getStreamChunk();
    
    ps.stderr.pipe(errorStream.stream);
    ps.stdout.pipe(outStream.stream);
    
    ps.on('exit', function (code) {
      if (!outStream.chunks.join("\n").includes("Usage:") || errorStream.chunks.length != 0) {
        t.fail("--help not working");
      }
      t.equal(code, 0);
      t.end();
    });
});

test('run arguments --version', function (t) {
  t.plan(1);

  let ps = execCommand(['--version']);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!outStream.chunks.join("\n").includes(require("../package.json").version) || errorStream.chunks.length != 0) {
      t.fail("--version not working");
    }
    t.equal(code, 0);
    t.end();
  });
});

test('run arguments new', function (t) {
  t.plan(1);

  let ps = execCommand(['new', '--device="Browser"', '--projectName="tap-test"']);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!fs.existsSync(path.resolve(__dirname, '../tap-test'))) {
      t.fail("ji new clone directory fail");
    }
    if (!fs.existsSync(path.resolve(__dirname, '../tap-test/node_modules'))) {
      t.fail("ji npm install project fail");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments build', function (t) {
  t.plan(1);

  let ps = execCommand(['build', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!fs.existsSync(path.resolve(__dirname, '../tap-test/dist'))) {
      t.fail("ji npm install project fail");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments debug', function (t) {
  t.plan(1);

  let ps = execCommand(['debug', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);

  setTimeout(() => spawn('kill', ['-3', ps.pid + '']), 2000);
  
  ps.on('exit', function (code) {
    t.pass("ok");
    t.end();
  });
});


test('run arguments generate not found', function (t) {
  t.plan(1);

  let ps = execCommand(['generate', 'nan', 'test-index', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    console.log(outStream.chunks.join("\n"));
    if (!errorStream.chunks.join("\n").includes('Generate Type nan not found.')) {
      t.fail("argument generate works should be KO");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments generate not found 2', function (t) {
  t.plan(1);

  let ps = execCommand(['generate', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!errorStream.chunks.join("\n").includes('Generate Type not found.')) {
      t.fail("Generate Type not found. should be KO");
    }
    t.pass("ok");
    t.end();
  });
});


test('run arguments generate index', function (t) {
  t.plan(1);

  let ps = execCommand(['generate', 'index', 'test-index', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!fs.existsSync(path.resolve(__dirname, '../tap-test/src/test-index/test-index.index.js'))) {
      t.fail("ji ng generate index fail");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments generate controller', function (t) {
  t.plan(1);

  let ps = execCommand(['generate', 'controller', 'toto', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!fs.existsSync(path.resolve(__dirname, '../tap-test/src/toto/toto.controller.js'))) {
      t.fail("ji ng generate controller fail");
    }
    t.pass("ok");
    t.end();
  });
});

test('run arguments generate controller --index', function (t) {
  t.plan(1);

  let ps = execCommand(['generate', 'controller', 'toto', '--index', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (!fs.existsSync(path.resolve(__dirname, '../tap-test/src/toto/toto.controller.js'))) {
      t.fail("ji ng generate controller fail");
    }
    t.pass("ok");
    t.end();
  });
});


test('test sepCase', function (t) {
  t.plan(1);

  t.equal(sepCase("Absiccee___1"), "absiccee-1");
  t.end();
});


test('run arguments build with deleted favicon', function (t) {
  t.plan(1);

  del.sync(path.resolve(__dirname, '../tap-test/dist'));
  del.sync(path.resolve(__dirname, '../tap-test/src/favicon.ico'));

  let ps = execCommand(['build', `--path="${path.resolve(__dirname, '../tap-test')}"`]);
  let errorStream = getStreamChunk();
  let outStream = getStreamChunk();
  
  ps.stderr.pipe(errorStream.stream);
  ps.stdout.pipe(outStream.stream);
  
  ps.on('exit', function (code) {
    if (fs.existsSync(path.resolve(__dirname, '../tap-test/dist/favicon.ico'))) {
      t.fail("run arguments build with deleted favicon");
    }
    t.pass("ok");
    t.end();
  });
});