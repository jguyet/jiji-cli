const yargsParser = require('yargs-parser');

module.exports = parse;

const parserConfig = {
    alias: {
        run: 'r',
        version: 'v',
        help: 'h',
        open: 'o',
        watch: 'w',
        port: 'p'
    },
    array: [],
    nargs: {
        run: 1,
        config: 1,
        port: 1
    },
    boolean: ['version', 'help', 'open', 'watch'],
};

function version() {
    const {
        version
    } = require('../package.json');
    return `ji version: ${ version }`;
}

function usage() {
    return `
Usage:
  node_modules/.bin/ji [command] [options]

Commands:
  new                Initialize application
  serve              debug application in webserver
  build              Export application to dist/ directory

Options:
  -p, --port         change debug port default --port=8080
  -v, --version      Show version number
  -h, --help         Show help
  -o, --open         Open browser Page
  -w, --watch        Enable watch folding
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
    if (argv.p && !Number.isInteger(argv.p)) {
        console.error('--port need number value.');
        return 0;
    }
    if (argv._.length != 1) {
        console.log(usage());
        console.error('Please specify a single command.');
        return 1;
    }
    argv.command = argv._[0];
    return argv;
}