const Jiji = require("jiji-js");

module.exports = {
    path: "/", controller: {
        constructor: (controller, callback, detectChange) => {
            detectChange();
            callback();
        },
        destroy: (controller) => {
            console.log('page2 destroyed');
        },
        innerHTML: `
            <div style="display:flex;">
                Current page are Page2
                <button touch-link href="/page1" >Go to page1</div>
            </div>
        `
    }
};