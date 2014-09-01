var Promise = require('promise');
var Route = require('./lib/Route');
var RouteMap = require('./lib/RouteMap');
var RouteParams = require('./lib/RouteParams');
var RegExpParam = require('./lib/param/RegExpParam');
var RouteTokenStream = require('./lib/RouteTokenStream');

function parseUrl(url) {
    var m = /^([^?#]*?)(?:\?([^#]*))?(?:#(.*))?$/.exec(url);
    if (m) {
        return {
            path: m[1],
            queryString: m[2] || '',
            hash: m[3] || ''
        };
    }
    return {
        path: url,
        queryString: '',
        hash: ''
    };
}

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
    this.params = {};
    this.urlResolvers = {};

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
 * @param {string} url
 * @param {object} [options]
 * @param {boolean} [options.tolerateTrailingSlash=false]
 * @returns {Promise<RouteMatch>}
 */
Router.prototype.findRoute = function (url, options) {
    var urlInfo = parseUrl(url);
    var byString = [
        {
            map: this.map,
            stream: tokenize(urlInfo.path),
            params: {}
        }
    ];
    var byMatcher = [];
    options = options || {};
    var tolerateTrailingSlash = Boolean(options.tolerateTrailingSlash);

    function buildRouteParams(routeParams) {
        var result = new RouteParams(routeParams);
        if (urlInfo.queryString.length > 0) {
            var pairs = urlInfo.queryString.split('&');
            for (var i = 0, len = pairs.length; i < len; ++i) {
                var pair = pairs[i];
                var m = /^([^=]+)=(.*)$/.exec(pair);
                if (m) {
                    result.addQueryParamValue(decodeURIComponent(m[1]), decodeURIComponent(m[2]));
                } else {
                    result.addQueryParamValue(decodeURIComponent(pair), '');
                }
            }
        }
        return result;
    }

    function resolveRoute() {
        var info, token, map, stream, i, len, matcher, prefix, wrapper;
        return new Promise(function (resolve, reject) {
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
                            return resolve({
                                route: map.getFirstRoute(),
                                params: buildRouteParams(info.params)
                            });
                        }
                    }
                } else if (tolerateTrailingSlash && token === '/' && !stream.hasNext()) {
                    if (info.map.hasRoutes()) {
                        return resolve({
                            route: info.map.getFirstRoute(),
                            params: buildRouteParams(info.params)
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
                                return resolve({
                                    route: info.map.getFirstRoute(),
                                    params: buildRouteParams(addParam(info.params, name, value))
                                });
                            }
                        } else {
                            byString.push({
                                map: info.map,
                                stream: stream,
                                params: addParam(info.params, name, value)
                            });
                        }
                        return resolveRoute();
                    }, resolveRoute).then(resolve);
            }
            reject(Error('route not found'));
        });
    }

    return resolveRoute();
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
 * @param {string} name
 * @param {function} resolver
 * @returns {Router}
 */
Router.prototype.urlResolver = function (name, resolver) {
    this.urlResolvers[name] = resolver;
    return this;
};

/**
 * @param {string} typeName
 * @param {string} name
 * @param {string} [prefix='']
 * @returns {RouteParam}
 */
Router.prototype.createParam = function (typeName, name, prefix) {
    if (this.types.hasOwnProperty(typeName)) {
        var key = typeName + ':' + name + ':' + prefix;
        if (!this.params.hasOwnProperty(key)) {
            this.params[key] = new this.types[typeName](name, prefix || '');
        }
        return this.params[key];
    }
    return null;
};

/**
 * @param {string} name
 * @param {string} pattern
 * @param {string} [prefix='']
 * @returns {RegExpParam}
 */
Router.prototype.createRegExpParam = function (name, pattern, prefix) {
    var key = 'regexp:' + name + ':' + pattern + ':' + prefix;
    if (!this.params.hasOwnProperty(key)) {
        this.params[key] = new RegExpParam(name, prefix, pattern);
    }
    return this.params[key];
};

/**
 * @param {string} routeName
 * @param {object} [params]
 * @returns {Promise<string>}
 */
Router.prototype.url = function (routeName, params) {
    var _this = this;

    function getUrl(routeName, params) {
        if (_this.namedRoutes.hasOwnProperty(routeName)) {
            return _this.namedRoutes[routeName].url(params);
        }
        return Promise.reject(Error('no route with name "' + routeName + '"'));
    }

    if (this.urlResolvers.hasOwnProperty(routeName)) {
        return this.urlResolvers[routeName](params || {}, getUrl);
    }
    return getUrl(routeName, params);
};

module.exports = Router;
