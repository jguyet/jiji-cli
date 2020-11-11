const {
    existsSync
} = require('fs');
const ora = require('ora');
const path = require("path");
const replaceStringToFile = require('./utils/replaceStringToFile');

function mountBuildCmds(dirPath, mainPath, mainDirPath, destPath, generatedMainJsFilename, generatedStyleCssFilename, options = {}) {
    var array = [
        {
            cond: () => existsSync(`${destPath}`),
            cmd: `rm -rf "${destPath}"`
        },
        {
            cond: () => !existsSync(`${destPath}`),
            cmd: `mkdir "${destPath}"`
        },
        {
            cmd: `node "${path.resolve(dirPath, "node_modules/browserify/bin/cmd.js")}" "${mainPath}" > "${destPath}/${generatedMainJsFilename}"`,
            error: (error) => {
                ora(error).fail(error.message);//.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        },
        {
            cmd: `cp "${mainDirPath}/index.html" "${destPath}/index.html"`,
            error: (error) => {
                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        },
        {
            cmd: `cp "${mainDirPath}/style.css" "${destPath}/${generatedStyleCssFilename}"`,
            error: (error) => {
                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        },
        {
            cond: () => existsSync(`${mainDirPath}/favicon.ico`),
            cmd: `cp "${mainDirPath}/favicon.ico" "${destPath}/favicon.ico"`,
            error: (error) => {
                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        },
        {
            cond: () => existsSync(`${mainDirPath}/public`),
            cmd: `cp -R "${mainDirPath}/public" "${destPath}/public"`,
            error: (error) => {
                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        },
        {
          cmd: (success, failure) => {
              replaceStringToFile(`${destPath}/index.html`, /\<script\s+src\=\"(?:\.\/)?index.js\"\>(?:\w*\s*)*\<\/script\>/g, `<script src="${generatedMainJsFilename}"></script>`);
              success();
          }
        },
        {
          cmd: (success, failure) => {
              replaceStringToFile(`${destPath}/index.html`, /\<link\s+rel\=\"stylesheet\"\s+type\=\"text\/css\"\s+href\=\"(?:\.\/)?style\.css\"\>/g, `<link rel="stylesheet" type="text/css" href="${generatedStyleCssFilename}">`);
              success();
          }
        }
    ];

    if (options.minify) {
        array.push({
            cmd: `node "${path.resolve(dirPath, "node_modules/minify/bin/minify.js")}" "${destPath}/${generatedMainJsFilename}" > "${destPath}/min-${generatedMainJsFilename}"`,
            success: () => {},
            error: console.error
        },
        {
            cmd: `mv "${destPath}/min-${generatedMainJsFilename}" "${destPath}/${generatedMainJsFilename}"`,
            success: () => {},
            error: (error) => {
                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        });
    }

    if (options.htaccess) {
        array.push({
            cmd: `cp "${path.resolve(require.main.filename, '../../')}/build-htaccess/.htaccess" "${destPath}/.htaccess"`,
            success: () => {},
            error: (error) => {
                ora(error).warn(error.message.split("\n").filter(x => x !== '').slice(1).join("\n"));
            }
        });
    }
    return array;
};

module.exports = mountBuildCmds;