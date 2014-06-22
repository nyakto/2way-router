var vow = require('vow');
var Route = require('./lib/Route');
var RouteMap = require('./lib/RouteMap');
var RouteTokenStream = require('./lib/RouteTokenStream');

function addParam(params, name, value) {
    var result = {};
    for (var k in params) {
        if (params.hasOwnProperty(k)) {
            result[k] = params[k];
        }
    }
    result[name] = value;
    return result;
}

function tokenize(path) {
    var tokens = [], pos = 0, index;
    while ((index = path.indexOf('/', pos)) >= 0) {
        if (index > pos) {
            tokens.push(path.substr(pos, index - pos));
        }
        tokens.push('/');
        pos = index + 1;
    }
    if (pos < path.length) {
        tokens.push(path.substr(pos));
    }
    return new RouteTokenStream(tokens, 1, tokens[0]);
}

/**
 * @constructor
 */
function Router() {
    this.map = new RouteMap();
    this.types = {};
    this.routes = [];
    this.namedRoutes = {};

    this.registerType(require('./lib/param/NumberParam'), ['int', 'number']);
}

Router.Route = Route;

/**
 * @param {string} pathTemplate
 * @returns {Route}
 */
Router.prototype.route = function (pathTemplate) {
    return new Route(this, pathTemplate);
};

/**
 * @param {string} path
 * @param {object} [options]
 * @param {boolean} [options.tolerateTrailingSlash=false]
 * @returns {Promise<RouteMatch>}
 */
Router.prototype.findRoute = function (path, options) {
    var byString = [
        {
            map: this.map,
            stream: tokenize(path),
            params: {}
        }
    ];
    var byMatcher = [];
    options = options || {};
    var tolerateTrailingSlash = Boolean(options.tolerateTrailingSlash);

    function resolve() {
        var info, token, map, stream, i, len, matcher, prefix, wrapper;
        while (byString.length > 0) {
            info = byString.pop();
            stream = info.stream;
            token = stream.peek();
            if (info.map.hasPath(token)) {
                map = info.map.path(token);
                if (stream.hasNext()) {
                    byString.push({
                        map: map,
                        stream: stream.next(),
                        params: info.params
                    });
                } else {
                    if (!map.hasRoutes() && tolerateTrailingSlash && token !== '/' && map.hasPath('/')) {
                        map = map.path('/');
                    }
                    if (map.hasRoutes()) {
                        return vow.fulfill({
                            route: map.getFirstRoute(),
                            params: info.params
                        });
                    }
                }
            } else if (tolerateTrailingSlash && token === '/' && !stream.hasNext()) {
                if (info.map.hasRoutes()) {
                    return vow.fulfill({
                        route: info.map.getFirstRoute(),
                        params: info.params
                    });
                }
            }
            map = info.map;
            len = map.byMatcher.length;
            for (i = 0; i < len; ++i) {
                matcher = map.matchers[i];
                prefix = stream.test(matcher.prefix);
                if (prefix !== null) {
                    byMatcher.push({
                        map: map.byMatcher[i],
                        matcher: matcher,
                        stream: stream.skip(prefix.length),
                        params: info.params
                    });
                }
            }
        }
        if (byMatcher.length > 0) {
            info = byMatcher.shift();
            wrapper = info.stream.wrap();
            return info.matcher.parse(wrapper)
                .then(function (value) {
                    var name = info.matcher.name;
                    stream = wrapper.getTokenStream();
                    if (stream.isEmpty()) {
                        if (info.map.hasRoutes()) {
                            return vow.fulfill({
                                route: info.map.getFirstRoute(),
                                params: addParam(info.params, name, value)
                            });
                        }
                    } else {
                        byString.push({
                            map: info.map,
                            stream: stream,
                            params: addParam(info.params, name, value)
                        });
                    }
                    return resolve();
                }, resolve);
        }
        return vow.reject();
    }

    return resolve();
};

/**
 * @param {RouteParam} typeConstructor
 * @param {string|string[]} names
 */
Router.prototype.registerType = function (typeConstructor, names) {
    if (Object.prototype.toString.call(names) === '[object Array]') {
        for (var i = 0; i < names.length; ++i) {
            this.types[names[i]] = typeConstructor;
        }
    } else {
        this.types[names] = typeConstructor;
    }
};

/**
 * @param {string} typeName
 * @param {string} name
 * @param {string} [prefix='']
 * @returns {RouteParam}
 */
Router.prototype.createParam = function (typeName, name, prefix) {
    if (this.types.hasOwnProperty(typeName)) {
        return new this.types[typeName](name, prefix || '');
    }
    return null;
};

/**
 * @param {string} routeName
 * @param {object} [params]
 * @returns {Promise<string>}
 */
Router.prototype.url = function (routeName, params) {
    if (this.namedRoutes.hasOwnProperty(routeName)) {
        return this.namedRoutes[routeName].url(params);
    }
    return vow.reject();
};

module.exports = Router;
