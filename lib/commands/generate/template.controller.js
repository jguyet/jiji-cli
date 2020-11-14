const Jiji = require("jiji-js");

module.exports = {
    title: "$sepCaseControllerName",
    constructor: function (callback) {
        console.log("construct");
        callback();
    },
    mounted: function () {
        console.log("mounted");
    },
    destroy: function () {
        console.log("destroy");
    },
    innerHTML: require("./$sepCaseControllerName.html")
};
