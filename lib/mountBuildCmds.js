const {
    existsSync,
    mkdirSync,
    unlinkSync,
    rmdirSync,
    copyFileSync,
    renameSync
} = require('fs');
const ora = require('ora');
const path = require("path");
const replaceStringToFile = require('./utils/replaceStringToFile');
const copyFolderSync = require('./utils/copyFolderSync');
const del = require("del");

function mountBuildCmds(dirPath, mainPath, mainDirPath, destPath, generatedMainJsFilename, generatedStyleCssFilename, options = {}) {
    
    var array = [
        {
            cond: () => existsSync(destPath),
            cmd: (success, failure) => { try { del.sync(destPath); success(); } catch (e) { failure(e); } }
        },
        {
            cond: () => !existsSync(destPath),
            cmd: (success, failure) => { try { mkdirSync(destPath); success(); } catch(e) { failure(e) } }
        },
        {
            cmd: `${process.execPath} "${path.resolve(dirPath, "node_modules/browserify/bin/cmd.js")}" "${mainPath}" > "${destPath}/${generatedMainJsFilename}"`,
            error: (error) => {
                ora(error).fail(error.message);
            }
        },
        {
            cmd: (success, failure) => { try { copyFileSync(path.resolve(mainDirPath, "index.html"), path.resolve(destPath, "index.html")); success(); } catch(e) { failure(e) } },
            error: (error) => {
                ora(error).warn(error.message);
            }
        },
        {
            cmd: (success, failure) => { try { copyFileSync(path.resolve(mainDirPath, "style.css"), path.resolve(destPath, generatedStyleCssFilename)); success(); } catch(e) { failure(e) } },
            error: (error) => {
                ora(error).warn(error.message);
            }
        },
        {
            cond: () => existsSync(`${path.resolve(mainDirPath, "favicon.ico")}`),
            cmd: (success, failure) => { try { copyFileSync(path.resolve(mainDirPath, "favicon.ico"), path.resolve(destPath, "favicon.ico")); success(); } catch(e) { failure(e) } },
            error: (error) => {
                ora(error).warn(error.message);
            }
        },
        {
            cond: () => existsSync(`${path.resolve(mainDirPath, "public")}`),
            cmd: (success, failure) => { try { copyFolderSync(path.resolve(mainDirPath, "public"), path.resolve(destPath, "public")); success(); } catch(e) { failure(e) } },
            error: (error) => {
                ora(error).warn(error.message);
            }
        },
        {
          cmd: (success, failure) => {
              try {
                replaceStringToFile(`${path.resolve(destPath, "index.html")}`, /\<script\s+src\=\"(?:\.\/)?index.js\"\>(?:\w*\s*)*\<\/script\>/g, `<script src="${generatedMainJsFilename}"></script>`);
                success();
              } catch(e) {
                  failure(e.message);
              }
          }
        },
        {
          cmd: (success, failure) => {
            try {
                replaceStringToFile(`${path.resolve(destPath, "index.html")}`, /\<link\s+rel\=\"stylesheet\"\s+type\=\"text\/css\"\s+href\=\"(?:\.\/)?style\.css\"\>/g, `<link rel="stylesheet" type="text/css" href="${generatedStyleCssFilename}">`);
                success();
            } catch(e) {
                failure(e.message);
            }
          }
        }
    ];

    if (options.minify) {
        array.push({
            cmd: `${process.execPath} "${path.resolve(dirPath, "node_modules/minify/bin/minify.js")}" "${path.resolve(destPath, generatedMainJsFilename)}" > "${path.resolve(destPath, "min-" + generatedMainJsFilename)}"`,
            success: () => {},
            error: console.error
        },
        {
            cmd: (success, failure) => { try { renameSync(path.resolve(destPath, "min-" + generatedMainJsFilename), path.resolve(destPath, generatedMainJsFilename)); success(); } catch(e) { failure(e) } },
            success: () => {},
            error: (error) => {
                ora(error).warn(error.message);
            }
        });
    }

    if (options.htaccess) {
        array.push({
            cmd: (success, failure) => { try { copyFileSync(path.resolve(require.main.filename, "../../", "build-htaccess/.htaccess"), path.resolve(destPath, ".htaccess")); success(); } catch(e) { failure(e) } },
            success: () => {},
            error: (error) => {
                ora(error).warn(error.message)
            }
        });
    }
    return array;
};

module.exports = mountBuildCmds;