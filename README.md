# jiji-cli

CLI for jiji-js

## Installation

npm install -g jiji-cli

## Usage

````shell
ji [options]
ji --help
````

````shell
ji -r ""
ji -r init
````

#### `--run="command" | -m [command]`

- `-r init` - create new sample application
- `-r serve` - create server in default 8080 port with application pre-builded
- `-r build` - build your application to dist directory

#### `--help|-h`

Show help

### Examples

Use for create sample application :

````shell
$ ji -r init 
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
$ ji -r serve
Start build before starting debug server
----------------------------------------
App listening at http://localhost:8080
````

Use for build application :

````shell
$ ji -r build
Start build
----------------------------------------
Build Finished.
````

````shell
$ ls dist
index.html      index.js
````

## License

MIT
