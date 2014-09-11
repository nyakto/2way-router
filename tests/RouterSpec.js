/*global describe, xdescribe, it, expect*/
var Router = require('../index');

describe("router", function () {
    it("allows to create routes", function () {
        var router = new Router();
        var route = router.route("/");
        expect(route).not.toBeNull();
        expect(route instanceof Router.Route).toBeTruthy();
    });

    function always(promise, fn) {
        promise.then(function (value) {
            return fn(value, true);
        }, function (error) {
            return fn(error, false);
        });
    }

    function expectRoute(promise, route, done) {
        always(promise, function (value, resolved) {
            expect(resolved).toBe(true);
            if (resolved) {
                expect(value.route).toBe(route);
            }
            done();
        });
    }

    function expectValue(promise, expectedValue, done) {
        always(promise, function (value, resolved) {
            expect(resolved).toBe(true);
            if (resolved) {
                expect(value).toBe(expectedValue);
            }
            done();
        });
    }

    function expectRouteWithParams(promise, route, params, done) {
        always(promise, function (value, resolved) {
            expect(resolved).toBe(true);
            if (resolved) {
                expect(value.route).toBe(route);
                expect(value.params.merge()).toEqual(params);
            }
            done();
        });
    }

    function shouldFail(promise, done) {
        always(promise, function (value, resolved) {
            expect(resolved).toBe(false);
            done();
        });
    }

    describe("allows to findRoute route:", function () {
        var router = new Router();
        var routeA = router.route("/route/a");
        var routeB = router.route("/route/b");

        it("should match '/route/a' to routeA", function (done) {
            expectRoute(router.findRoute("/route/a"), routeA, done);
        });

        it("should match '/route/b' to routeB", function (done) {
            expectRoute(router.findRoute("/route/b"), routeB, done);
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
            expectRoute(router.findRoute("/route/a"), routeA, done);
        });

        it("should return correct route with trailing slash", function (done) {
            expectRoute(router.findRoute("/route/a/"), routeB, done);
        });

        it("should reject if no path with trailing slash", function (done) {
            shouldFail(router.findRoute("/route/c/"), done);
        });

        it("should reject if no path without trailing slash", function (done) {
            shouldFail(router.findRoute("/route/d"), done);
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
            expectRouteWithParams(router.findRoute("/news/page/1/"), routeA, {
                page: 1
            }, done);
        });

        it("should match '/news/page/205/' to routeA with page=205", function (done) {
            expectRouteWithParams(router.findRoute("/news/page/205/?a=1&a=3&b=2&c"), routeA, {
                a: [ '1', '3' ],
                b: [ '2' ],
                c: [ '' ],
                page: 205
            }, done);
        });

        it("should match '/news/archive/2014-06-21/' to routeB with year=2014, month=6, day=21", function (done) {
            expectRouteWithParams(router.findRoute("/news/archive/2014-06-21/"), routeB, {
                year: 2014,
                month: 6,
                day: 21
            }, done);
        });

        it("should match '/news/100500' to routeC with id=100500", function (done) {
            expectRouteWithParams(router.findRoute("/news/100500"), routeC, {
                id: 100500
            }, done);
        });
    });

    describe("supports regexp params:", function () {
        var router = new Router();
        var routeA = router.route("/news/page/{page ~ /\\d+/}");
        var routeB = router.route("/news/archive/{year ~ /\\d{4}/}-{month ~ /\\d{2}/}-{day ~ /\\d{2}/}");
        var routeC = router.route("/news/{id:int}");
        var routeD = router.route('/news/{id:int}/comments');

        it("should match '/news/page/13' to routeA with page='13'", function (done) {
            expectRouteWithParams(router.findRoute("/news/page/13"), routeA, {
                page: '13'
            }, done);
        });

        it("should match '/news/archive/2014-06-21' to routeB with year='2014', month='06', day='21'", function (done) {
            expectRouteWithParams(router.findRoute("/news/archive/2014-06-21"), routeB, {
                year: '2014',
                month: '06',
                day: '21'
            }, done);
        });

        it("should match '/news/100500' to routeC with id='100500'", function (done) {
            expectRouteWithParams(router.findRoute("/news/100500"), routeC, {
                id: 100500
            }, done);
        });

        it("should match '/news/100500/comments' to routeD with id='100500'", function (done) {
            expectRouteWithParams(router.findRoute("/news/100500/comments"), routeD, {
                id: 100500
            }, done);
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
            expectRoute(router.findRoute("/route/a/", {
                tolerateTrailingSlash: true
            }), routeA, done);
        });

        it("should search path with trailing slash", function (done) {
            expectRoute(router.findRoute("/route/b", {
                tolerateTrailingSlash: true
            }), routeB, done);
        });

        it("should respect route priority for path without trailing slash", function (done) {
            expectRoute(router.findRoute("/route/c", {
                tolerateTrailingSlash: true
            }), routeC, done);
        });

        it("should respect route priority for path with trailing slash", function (done) {
            expectRoute(router.findRoute("/route/d/", {
                tolerateTrailingSlash: true
            }), routeD, done);
        });
    });

    describe("supports creating urls for routes:", function () {
        var router = new Router();
        var news = router.route("/news/").name("news");
        var newsArchive = router.route("/news/archive/{year:int}-{month:int}-{day:int}/").name("newsArchive");
        var newsPublication = router.route("/news/{id:int}/").name("newsPublication");

        it("should create url '/news/' from news route", function (done) {
            expectValue(news.url(), "/news/", done);
        });

        it("should create url '/news/' from route named 'news'", function (done) {
            expectValue(router.url("news"), "/news/", done);
        });

        it("should create url '/news/archive/2014-6-21/' from newsArchive route with year=2014, month=6, day=21", function (done) {
            expectValue(newsArchive.url({
                year: 2014,
                month: 6,
                day: 21
            }), "/news/archive/2014-6-21/", done);
        });

        it("should create url '/news/archive/2014-6-21/' from route named 'newsArchive' with year=2014, month=6, day=21", function (done) {
            expectValue(router.url("newsArchive", {
                year: 2014,
                month: 6,
                day: 21
            }), "/news/archive/2014-6-21/", done);
        });

        it("should create url '/news/100500/' from newsPublication route with id=100500", function (done) {
            expectValue(newsPublication.url({
                id: 100500
            }), "/news/100500/", done);
        });

        it("should create url '/news/100500/?a=1&b=2' from route named 'newsPublication' with id=100500, a=1, b=2, c=null", function (done) {
            expectValue(router.url("newsPublication", {
                id: 100500,
                a: 1,
                b: 2,
                c: null
            }), "/news/100500/?a=1&b=2", done);
        });
    });

    describe("supports url resolvers:", function () {
        var router = new Router();
        router.route("/news/")
            .name("news");
        router.route("/news/archive/{year:int}-{month:int}-{day:int}/")
            .name("news.archive");

        router.urlResolver("news", function (params, url) {
            if (params.date) {
                return url("news.archive", {
                    year: params.date.getFullYear(),
                    month: params.date.getMonth() + 1,
                    day: params.date.getDate()
                });
            }
            return url("news");
        });

        var date = new Date();
        router.url("news").then(function (url) {
            expect(url)
                .toBe("/news/");
        });
        router.url("news", { date: date }).then(function (url) {
            expect(url)
                .toBe("/news/archive/" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "/");
        });
    });

    describe("supports default params:", function () {
        var router = new Router();
        var routeA = router.route("/news/")
            .setDefaultParams({
                page: 1
            });
        var routeB = router.route("/news/page/{page:int}/");

        it("should match '/news/' to routeA with page=1", function (done) {
            expectRouteWithParams(router.findRoute("/news/"), routeA, {
                page: 1
            }, done);
        });

        it("should match '/news/page/2/' to routeB with page=2", function (done) {
            expectRouteWithParams(router.findRoute("/news/page/2/"), routeB, {
                page: 2
            }, done);
        });
    });
});
