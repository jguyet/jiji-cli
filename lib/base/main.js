const Jiji = require("jiji-js");

Jiji.initialize("browser", () => {
    Jiji.Router.init([
        require("./src/page1"),
        require("./src/page2")
    ]);
    Jiji.Router.route();
});