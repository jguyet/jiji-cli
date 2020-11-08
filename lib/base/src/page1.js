const Jiji = require("jiji-js");

module.exports = {
    path: "/page1", controller: {
        constructor: (controller, callback, detectChange) => {
            detectChange();
            callback();
        },
        destroy: (controller) => {
            console.log('page1 destroyed');
        },
        innerHTML: `
            <div style="display:flex;">
                Current page are Page1
                <button touch-link href="/page2" >Go to page2</div>
            </div>
        `
    }
};