/**
 * @param {object} routeParams
 * @constructor
 */
function RouteParams(routeParams) {
    this.routeParams = routeParams;
    this.queryParams = {};
}

/**
 * @param {string} name
 * @param {string} value
 */
RouteParams.prototype.addQueryParamValue = function (name, value) {
    if (this.queryParams.hasOwnProperty(name)) {
        this.queryParams[name].push(value);
    } else {
        this.queryParams[name] = [value];
    }
};

/**
 * @param {string} name
 * @param {*} [defaultValue=null]
 * @returns {*}
 */
RouteParams.prototype.getRouteParam = function (name, defaultValue) {
    if (this.routeParams.hasOwnProperty(name)) {
        return this.routeParams[name];
    }
    if (typeof defaultValue === 'undefined') {
        return null;
    }
    return defaultValue;
};

/**
 * @param {string} name
 * @param {string} [defaultValue=null]
 * @returns {string}
 */
RouteParams.prototype.getQueryParam = function (name, defaultValue) {
    var values = this.getQueryParamValues(name);
    if (values.length > 0) {
        return values[values.length - 1];
    }
    if (typeof defaultValue === 'undefined') {
        return null;
    }
    return defaultValue;
};

/**
 * @param {string} name
 * @returns {string[]}
 */
RouteParams.prototype.getQueryParamValues = function (name) {
    if (this.queryParams.hasOwnProperty(name)) {
        return this.queryParams[name];
    }
    return [];
};

/**
 * @returns {object}
 */
RouteParams.prototype.merge = function () {
    var result = {}, name;
    for (name in this.queryParams) {
        if (this.queryParams.hasOwnProperty(name)) {
            result[name] = this.queryParams[name];
        }
    }
    for (name in this.routeParams) {
        if (this.routeParams.hasOwnProperty(name)) {
            result[name] = this.routeParams[name];
        }
    }
    return result;
};

module.exports = RouteParams;
