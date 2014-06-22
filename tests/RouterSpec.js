/*global describe, xdescribe, it, expect*/
var Router = require('../index');

describe("router", function () {
    it("allows to create routes", function () {
        var router = new Router();
        var route = router.route("/");
        expect(route).not.toBeNull();
        expect(route instanceof Router.Route).toBeTruthy();
    });

    describe("allows to findRoute route:", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b");

        it("should match '/route/a' to routeA", function (done) {
            router.findRoute("/route/a").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeA);
                }
                done();
            });
        });

        it("should match '/route/b' to routeB", function (done) {
            router.findRoute("/route/b").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeB);
                }
                done();
            });
        });
    });

    describe("is strict to trailing slash:", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/a/");
        router.route("/route/c");
        router.route("/route/d/");

        it("should declare separate routes for path with trailing slash and without such one", function () {
            expect(routeA).not.toBe(routeB);
        });

        it("should return correct route without trailing slash", function (done) {
            router.findRoute("/route/a").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeA);
                }
                done();
            });
        });

        it("should return correct route with trailing slash", function (done) {
            router.findRoute("/route/a/").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeB);
                }
                done();
            });
        });

        it("should reject if no path with trailing slash", function (done) {
            router.findRoute("/route/c/").always(function (p) {
                expect(p.isRejected()).toBe(true);
                done();
            });
        });

        it("should reject if no path without trailing slash", function (done) {
            router.findRoute("/route/d").always(function (p) {
                expect(p.isRejected()).toBe(true);
                done();
            });
        });
    });

    xdescribe("supports string params:", function () {
    });

    describe("supports numeric params:", function () {
        var router = new Router();
        var routeA = router.route("/news/page/{page:number}/");
        var routeB = router.route("/news/archive/{year:number}-{month:number}-{day:number}/");
        var routeC = router.route("/news/{id:number}");

        it("should match '/news/page/1/' to routeA with page=1", function (done) {
            router.findRoute("/news/page/1/").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeA);
                    expect(p.valueOf().params).toEqual({
                        page: 1
                    });
                }
                done();
            });
        });

        it("should match '/news/page/205/' to routeA with page=205", function (done) {
            router.findRoute("/news/page/205/").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeA);
                    expect(p.valueOf().params).toEqual({
                        page: 205
                    });
                }
                done();
            });
        });

        it("should match '/news/archive/2014-06-21/' to routeB with year=2014, month=6, day=21", function (done) {
            router.findRoute("/news/archive/2014-06-21/").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeB);
                    expect(p.valueOf().params).toEqual({
                        year: 2014,
                        month: 6,
                        day: 21
                    });
                }
                done();
            });
        });

        it("should match '/news/100500' to routeC with id=100500", function (done) {
            router.findRoute("/news/100500").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeC);
                    expect(p.valueOf().params).toEqual({
                        id: 100500
                    });
                }
                done();
            });
        });
    });

    describe("supports regexp params:", function () {
        var router = new Router();
        var routeA = router.route("/news/page/{page ~ /\\d+/}");
        var routeB = router.route("/news/archive/{year ~ /\\d{4}/}-{month ~ /\\d{2}/}-{day ~ /\\d{2}/}");
        var routeC = router.route("/news/{id ~ /\\d+/}");

        it("should match '/news/page/13' to routeA with page='13'", function (done) {
            router.findRoute("/news/page/13").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeA);
                    expect(p.valueOf().params).toEqual({
                        page: '13'
                    });
                }
                done();
            });
        });

        it("should match '/news/archive/2014-06-21' to routeB with year='2014', month='06', day='21'", function (done) {
            router.findRoute("/news/archive/2014-06-21").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeB);
                    expect(p.valueOf().params).toEqual({
                        year: '2014',
                        month: '06',
                        day: '21'
                    });
                }
                done();
            });
        });

        it("should match '/news/100500' to routeC with id='100500'", function (done) {
            router.findRoute("/news/100500").always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeC);
                    expect(p.valueOf().params).toEqual({
                        id: '100500'
                    });
                }
                done();
            });
        });
    });

    describe("has a tolerateTrailingSlash option:", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b/");
        var routeC = router.route("/route/c");
        router.route("/route/c/");
        var routeD = router.route("/route/d/");
        router.route("/route/d");

        it("should search path without trailing slash", function (done) {
            router.findRoute("/route/a/", {
                tolerateTrailingSlash: true
            }).always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeA);
                }
            });
        });

        it("should search path with trailing slash", function (done) {
            router.findRoute("/route/b", {
                tolerateTrailingSlash: true
            }).always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeB);
                }
            });
        });

        it("should respect route priority for path without trailing slash", function (done) {
            router.findRoute("/route/c", {
                tolerateTrailingSlash: true
            }).always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeC);
                }
            });
        });

        it("should respect route priority for path with trailing slash", function (done) {
            router.findRoute("/route/d/", {
                tolerateTrailingSlash: true
            }).always(function (p) {
                expect(p.isFulfilled()).toBe(true);
                if (p.isFulfilled()) {
                    expect(p.valueOf().route).toBe(routeD);
                }
            });
        });
    });
});
