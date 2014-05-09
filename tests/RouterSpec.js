/*global describe, it, expect, beforeEach*/
var Router = require('../index');

describe("router", function () {
    var router;

    beforeEach(function () {
        router = new Router();
    });

    it("allows to create routes", function () {
        var route = router.route("/");
        expect(route).not.toBeNull();
        expect(route instanceof Router.Route).toBeTruthy();
    });
});
