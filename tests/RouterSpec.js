/*global describe, it, expect*/
var Router = require('../index');

describe("router", function () {
    it("allows to create routes", function () {
        var router = new Router();
        var route = router.route("/");
        expect(route).not.toBeNull();
        expect(route instanceof Router.Route).toBeTruthy();
    });

    it("allows to detect route", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b");

        router.detect("/route/a", function (route) {
            expect(route).toBe(routeA);
        });
        router.detect("/route/b", function (route) {
            expect(route).toBe(routeB);
        });
    });

    describe("is strict to trailing slash", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/a/");
        router.route("/route/c");
        router.route("/route/d/");

        it("should declare separate routes for path with trailing slash and without such one", function () {
            expect(routeA).not.toBe(routeB);
        });

        it("should return correct route without trailing slash", function (done) {
            router.detect("/route/a", function (route) {
                expect(route).toBe(routeA);
                done();
            });
        });

        it("should return correct route with trailing slash", function (done) {
            router.detect("/route/a/", function (route) {
                expect(route).toBe(routeB);
                done();
            });
        });

        it("should return null if no path with trailing slash", function (done) {
            router.detect("/route/c/", function (route) {
                expect(route).toBeNull();
                done();
            });
        });

        it("should return null if no path without trailing slash", function (done) {
            router.detect("/route/d", function (route) {
                expect(route).toBeNull();
                done();
            });
        });
    });

    describe("with tolerance to trailing slash", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b/");
        var routeC = router.route("/route/c");
        router.route("/route/c/");
        var routeD = router.route("/route/d/");
        router.route("/route/d");

        it("should search path without trailing slash", function (done) {
            router.detect("/route/a/", {
                tolerateTrailingSlash: true
            }, function (route) {
                expect(route).toBe(routeA);
                done();
            });
        });

        it("should search path with trailing slash", function (done) {
            router.detect("/route/b", {
                tolerateTrailingSlash: true
            }, function (route) {
                expect(route).toBe(routeB);
                done();
            });
        });

        it("should respect route priority for path without trailing slash", function (done) {
            router.detect("/route/c", {
                tolerateTrailingSlash: true
            }, function (route) {
                expect(route).toBe(routeC);
                done();
            });
        });

        it("should respect route priority for path with trailing slash", function (done) {
            router.detect("/route/d/", {
                tolerateTrailingSlash: true
            }, function (route) {
                expect(route).toBe(routeD);
                done();
            });
        });
    });

    describe("works with params", function () {
        var router = new Router();
        var routeWithDefaultParams = router.route("/news/", {
            page: 1
        });
        var routeWithPageNumber = router.route("/news/page/", router.param.number("page"), "/");
        var routeWithPageName = router.route("/page/" + router.param.string("name") + "/");

        it("supports default values for params", function (done) {
            router.detect("/news/", function (route, params) {
                expect(route).toBe(routeWithDefaultParams);
                expect(params).toEqual({
                    page: 1
                });
                done();
            });
        });

        it("supports number params", function (done) {
            router.detect("/news/page/2/", function (route, params) {
                expect(route).toBe(routeWithPageNumber);
                expect(params).toEqual({
                    page: 2
                });
                done();
            });
        });

        it("supports string params", function (done) {
            router.detect("/page/about/", function (route, params) {
                expect(route).toBe(routeWithPageName);
                expect(params).toEqual({
                    name: 'about'
                });
                done();
            });
        });
    });
});
