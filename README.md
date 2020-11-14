<h1 align="center">Jiji - CLI</h1>

<p align="center">
  <img src="https://github.com/jguyet/jiji-framework-syntax-vsce/raw/master/docs/jiji-framework-logo.png" width="120px" height="120px"/>
  <br>
  <i>Jiji-js is a command line for building mobile and desktop web applications
    <br> using Jiji-js Framework</i>
  <br>
</p>

<p align="center">
<a href="https://npmjs.org/package/jiji-cli">
<img src="https://img.shields.io/npm/v/jiji-cli.svg?style=flat-square">
</a>&nbsp;
<a href="https://travis-ci.com/github/jguyet/jiji-cli">
<img src="https://travis-ci.com/jguyet/jiji-cli.svg">
</a>&nbsp;
<a href="https://tldrlegal.com/license/mit-license">
<img src="https://img.shields.io/npm/l/express.svg">
</a>
<!-- <a href="https://coveralls.io/github/jguyet/jiji-cli">
<img src="https://coveralls.io/repos/github/jguyet/jiji-cli/badge.svg?branch=master">
</a> -->
</p>

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
- `ji generate [type]` - command for generate controller or index
    - `ji generate controller [controller name]` - command for generate new controller
    - `ji generate index [index name]` - command for generate new index


#### `--help|-h`

Show help

### Examples

#### `ji new`

Use for create sample application :

````shell
$ ji new 
Which project name? : jiji-start
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

#### `ji debug`

Use for debug :

````shell
$ ji debug
Start build before starting debug server
----------------------------------------
App listening at http://localhost:8080
````

Go to http://localhost:8080

<img src="https://github.com/jguyet/jiji-start/raw/master/src/public/jiji-js.png"/>

#### `ji build`

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


#### `ji generate controller example`

````shell
$ ji generate controller example
CREATE Controller /Users/jeremyguyet/project/jiji-js.io/src/example/example.controller.js
CREATE View /Users/jeremyguyet/project/jiji-js.io/src/example/example.html.js
UPDATE Index /Users/jeremyguyet/project/jiji-js.io/src/index.js
Controller example CREATED
````

The name of the controller can be a path
During the controller generation you can add --index options for generate in same time an index in side controller generated.

#### `ji generate index toto`

````shell
$ ji generate index toto
CREATE Index /Users/jeremyguyet/project/jiji-js.io/src/toto/toto.index.js
UPDATE Index /Users/jeremyguyet/project/jiji-js.io/src/index.js
Index toto CREATED
````


## License

MIT