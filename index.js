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
    return path.split('/').filter(function (part) {
        return part !== '';
    });
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
 * @returns Route
 */
Router.prototype.detect = function (path, options) {
    var map = this._map,
        len,
        i;
    path = simplifyPath(path);
    for (i = 0, len = path.length; i < len; ++i) {
        map = map.findPath(path[i]);
        if (map === null) {
            return null;
        }
    }
    return map.getAssignedRoute();
};

module.exports = Router;
