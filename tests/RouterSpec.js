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

    it("is strict to trailing slash", function () {
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/a/");
        var routeC = router.route("/route/c");
        var routeD = router.route("/route/d/");

        expect(routeA).not.toBe(routeB);
        expect(router.detect("/route/a")).toBe(routeA);
        expect(router.detect("/route/a/")).toBe(routeB);
        expect(router.detect("/route/c")).toBe(routeC);
        expect(router.detect("/route/c/")).toBeNull();
        expect(router.detect("/route/d")).toBeNull();
        expect(router.detect("/route/d/")).toBe(routeD);
    });

    it("allows to tolerate trailing slash", function () {
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b/");

        expect(router.detect("/route/a/")).toBeNull();
        expect(router.detect("/route/b")).toBeNull();
        expect(router.detect("/route/a/", {
            tolerateTrailingSlash: true
        })).toBe(routeA);
        expect(router.detect("/route/b", {
            tolerateTrailingSlash: true
        })).toBe(routeB);
    });
});
