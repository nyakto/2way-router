function Router() {
    this._routes = [];
    this._map = new RouteMap();
}

function Route() {
}

function RouteMap() {
    this._paths = {};
    this._assignedRoute = null;
}

function simplifyPath(path) {
    var simplifiedPath = path.split('/').filter(function (part) {
        return part !== '';
    });
    if (path.length === 0 || path.substr(path.length - 1) === '/') {
        simplifiedPath.push('/');
    }
    return simplifiedPath;
}

function preparePath(pathArray) {
    var result = [];
    Array.prototype.forEach.call(pathArray, function (path) {
        if (typeof path === 'string') {
            simplifyPath(path).forEach(function (path) {
                result.push(path);
            });
        } else {
            result.push(path);
        }
    });
    return result;
}

function defineRoute(route, map, paths) {
    paths.forEach(function (path) {
        map = map.createPath(path);
    });
    map.assignRoute(route);
}

Router.Route = Route;

RouteMap.prototype.createPath = function (path) {
    if (this._paths.hasOwnProperty(path)) {
        return this._paths[path];
    }
    var map = new RouteMap();
    this._paths[path] = map;
    return map;
};

RouteMap.prototype.findPath = function (path) {
    if (this._paths.hasOwnProperty(path)) {
        return this._paths[path];
    }
    return null;
};

RouteMap.prototype.assignRoute = function (route) {
    this._assignedRoute = route;
};

RouteMap.prototype.getAssignedRoute = function () {
    return this._assignedRoute;
};

/**
 * @param {object} [params={}]
 */
Route.prototype.link = function (params) {
};

Router.getRoutes = function () {
    return this._routes;
};

/**
 * @param {...string} paths
 * @returns Route
 */
Router.prototype.route = function (paths) {
    var route = new Route();
    this._routes.push(route);
    defineRoute(
        route,
        this._map,
        preparePath(arguments)
    );
    return route;
};

/**
 * @param {string} path
 * @param {object} [options]
 * @param {boolean} [options.ignoreEmpty=false]
 * @param {boolean} [options.tolerateTrailingSlash=false]
 * @returns Route
 */
Router.prototype.detect = function (path, options) {
    var map = this._map,
        nextMap,
        len,
        i;

    function tolerateTrailingSlash() {
        return options && options.tolerateTrailingSlash;
    }

    function pathEndsWithSlash() {
        return path.length > 0 && path[path.length - 1] === '/';
    }

    path = simplifyPath(path);
    for (i = 0, len = path.length; i < len; ++i) {
        nextMap = map.findPath(path[i]);
        if (nextMap === null) {
            if (i === len - 1 && pathEndsWithSlash() && tolerateTrailingSlash()) {
                continue;
            } else {
                return null;
            }
        }
        map = nextMap;
    }
    var route = map.getAssignedRoute();
    if (route === null && tolerateTrailingSlash() && !pathEndsWithSlash()) {
        map = map.findPath('/');
        if (map !== null) {
            return map.getAssignedRoute();
        }
    }
    return route;
};

module.exports = Router;
