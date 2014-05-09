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

    it("allows to detect route", function () {
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b");

        expect(router.detect("/route/a")).toBe(routeA);
        expect(router.detect("/route/b")).toBe(routeB);
    });
});
