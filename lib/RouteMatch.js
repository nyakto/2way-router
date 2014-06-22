/**
 * @param {Route} route
 * @param {object} params
 * @constructor
 */
function RouteMatch(route, params) {
    this.route = route;
    this.params = params;
}

module.exports = RouteMatch;
