const yargsParser = require('yargs-parser');

module.exports = parse;

const parserConfig = {
  alias: {
    run: 'r',
    config: 'c',
    version: 'v',
    help: 'h',
    open: 'o'
  },
  array: [ ],
  config: 'config',
  nargs: {
    run: 1,
    config: 1,
  },
  boolean: ['version', 'help', 'open'],
  coerce: {
    map: v => v === 'file' ? { inline: false } : v
  }
};

function version() {
  const { version } = require('../package.json');
  return `ji version: ${ version }`;
}

function usage() {
  return `
Usage:
  node_modules/.bin/ji command [--config|-c ji-config.json]

Commands:
  init               Initialize application
  serve              debug application in webserver
  build              Export application to dist/ directory

Options:
  -r, --run          Run command
  -v, --version      Show version number
  -h, --help         Show help
  -o, --open         Open browser Page

Examples:

# use autoprefixer as a postcss plugin:
ji run
`;
}

function parse(args = process.argv.slice(2)) {
  let argv = yargsParser(args, parserConfig);

  if (argv.version) {
    console.log(version());
    return 0;
  }
  if (argv.help) {
    console.log(usage());
    return 0;
  }
  if (!argv.r) {
    console.log(usage());
    console.error('Please specify a single command.');
    return 1;
  }
  return argv;
}

