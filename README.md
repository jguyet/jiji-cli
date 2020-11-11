[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
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

- `ji new` - create new sample application
- `ji debug` - create server in default 8080 port with application pre-builded
- `ji build` - build your application to dist directory

#### `--help|-h`

Show help

### Examples

Use for create sample application :

````shell
$ ji new 
What name do you want for the new workspace and the initial project? $> helloWorld

CREATE /Users/jeremyguyet/project/helloWorld/package.json (2424)
CREATE /Users/jeremyguyet/project/helloWorld/main.js (1528)
CREATE /Users/jeremyguyet/project/helloWorld/src/page1.js (4064)
CREATE /Users/jeremyguyet/project/helloWorld/src/page2.js (4024)
✔ Packages installed successfully.
✔ Successfully initialized.
````

````
$ cd helloWorld
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
$ ls dist
index.html      index.js      style.css
````

## License

MIT

[npm-image]: https://img.shields.io/npm/v/jiji-cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/jiji-cli
[travis-image]: https://travis-ci.com/jguyet/jiji-cli.svg
[travis-url]: https://travis-ci.com/github/jguyet/jiji-cli
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license