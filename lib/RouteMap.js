/**
 * @constructor
 */
function RouteMap() {
    this.byString = {};
    this.byMatcher = [];
    this.matchers = [];
    this.routes = [];
}

/**
 * @param {string} token
 * @returns {RouteMap}
 */
RouteMap.prototype.path = function (token) {
    if (this.byString.hasOwnProperty(token)) {
        return this.byString[token];
    }
    this.byString[token] = new RouteMap();
    return this.byString[token];
};

/**
 * @returns {boolean}
 */
RouteMap.prototype.hasPath = function (token) {
    return this.byString.hasOwnProperty(token);
};

/**
 * @param {Route} route
 */
RouteMap.prototype.addRoute = function (route) {
    this.routes.push(route);
};

/**
 * @param {RouteParam} matcher
 * @returns {RouteMap}
 */
RouteMap.prototype.addMatcher = function (matcher) {
    var index = this.matchers.indexOf(matcher);
    if (index >= 0) {
        return this.byMatcher[index];
    }
    var map = new RouteMap();
    this.byMatcher.push(map);
    this.matchers.push(matcher);
    return map;
};

/**
 * @returns {boolean}
 */
RouteMap.prototype.hasRoutes = function () {
    // TODO: проверять на trailing slash
    return this.routes.length > 0;
};

/**
 * @returns {Route}
 */
RouteMap.prototype.getFirstRoute = function () {
    // TODO: проверять на trailing slash
    return this.routes[0];
};

module.exports = RouteMap;
