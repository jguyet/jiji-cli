
function generate(options) {
    return new Promise((fresolve, freject) => {
        if (options.argv._.length < 2) {
            fresolve("Generate Type not found.");
            return ;
        }
        const t = options.argv._[1];

        const types = {
            controller: require("./controller/controller"),
            index: require("./index/index")
        };

        if (types[t] === undefined) {
            fresolve(`Generate Type ${t} not found.`);
            return;
        }

        if (t === "controller" && options.argv.index) {
            types["index"]({ type: t, ... options })
                .then(_ => types["controller"]({ type: t, ... options }))
                .then(result => fresolve(result))
                .catch(error => freject(error))
        } else {
            types[t]({ type: t, ... options })
                .then(result => fresolve(result))
                .catch(error => freject(error))
        }
    });
};

module.exports = generate;