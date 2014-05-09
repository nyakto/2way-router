function Router() {
}

function Route() {
}

Router.Route = Route;

/**
 * @param {object} [params={}]
 */
Route.prototype.link = function (params) {
};

Router.getRoutes = function () {
};

/**
 * @param {...string} paths
 * @returns Route
 */
Router.prototype.route = function (paths) {
};

/**
 * @param {string} path
 * @param {object} [options]
 * @param {boolean} [options.ignoreEmpty=false]
 * @returns Route
 */
Router.prototype.detect = function (path, options) {
};

module.exports = Router;
