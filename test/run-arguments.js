const test = require('tap').test;
const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');
const { getStreamChunk } = require('../lib/utils/test.util');
const del = require('del');

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
      t.end()
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
    t.end()
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
    t.pass("ok")
    t.end()
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
    t.pass("ok")
    t.end()
  });
});