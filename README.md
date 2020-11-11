[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Coverage][coverage]][coverage-url]
[![license][license-image]][license-url]

# jiji-cli


CLI for jiji-js

## Installation

````shell
npm install -g jiji-cli
````

## Usage

````shell
ji [command] [options]
ji --help
````

````shell
ji new
````

#### `[command]`

- `ji new` - create new application
- `ji debug` - start server in default 8080 port with application pre-builded
- `ji build` - build your application to dist directory

#### `--help|-h`

Show help

### Examples

Use for create sample application :

````shell
$ ji new 
Which project name? $> jiji-start
[1] Browser
[2] Mobile
[0] CANCEL
Which platform? [1, 2, 0]: 1
CREATE jiji-start/jiconfig.json (440 bytes)
CREATE jiji-start/package.json (3992 bytes)
CREATE jiji-start/README.md (152 bytes)
CREATE jiji-start/src/favicon.ico (34288 bytes)
CREATE jiji-start/src/home/home.controller.js (4104 bytes)
CREATE jiji-start/src/home/home.html.js (20576 bytes)
CREATE jiji-start/src/index.html (25472 bytes)
CREATE jiji-start/src/index.js (2096 bytes)
CREATE jiji-start/src/public/icon/codersrank.svg (6080 bytes)
CREATE jiji-start/src/public/icon/github.svg (6784 bytes)
CREATE jiji-start/src/public/icon/instacart.svg (4840 bytes)
CREATE jiji-start/src/public/jiji-js.png (460656 bytes)
CREATE jiji-start/src/public/logo.png (4728 bytes)
CREATE jiji-start/src/style.css (159744 bytes)
✔ Packages installed successfully.
✔ Successfully initialized.
````

````
$ cd jiji-start
````

Use for debug :

````shell
$ ji debug
Start build before starting debug server
----------------------------------------
App listening at http://localhost:8080
````

Go to http://localhost:8080

<img src="https://github.com/jguyet/jiji-start/raw/master/src/public/jiji-js.png"/>

Use for build application :

````shell
$ ji build
Start build
----------------------------------------
Build Finished.
````

````shell
$ ls -la dist
total 96
drwxr-xr-x   7 jeremyguyet  staff    224 11 nov 04:39 .
drwxr-xr-x  12 jeremyguyet  staff    384 11 nov 04:39 ..
-rw-r--r--   1 jeremyguyet  staff  14149 11 nov 04:39 WNDIjwXd7PUFcEmarIhkXbav9vPLyQqY.js
-rw-r--r--   1 jeremyguyet  staff   4286 11 nov 04:39 favicon.ico
-rw-r--r--   1 jeremyguyet  staff   3236 11 nov 04:39 index.html
drwxr-xr-x   6 jeremyguyet  staff    192 11 nov 04:39 public
-rw-r--r--   1 jeremyguyet  staff  19968 11 nov 04:39 yGiszU55qkH8jeX8Rnb2bYotYQGHgozX.css
````

## License

MIT

[npm-image]: https://img.shields.io/npm/v/jiji-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/jiji-cli
[travis-image]: https://travis-ci.com/jguyet/jiji-cli.svg
[travis-url]: https://travis-ci.com/github/jguyet/jiji-cli
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license
[coverage]: https://coveralls.io/repos/github/jguyet/jiji-cli/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/jguyet/jiji-cli