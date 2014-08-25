var Promise = require('promise');

/**
 * @constructor
 */
function RouteParam() {
}

/**
 * @param {*} value
 * @returns {Promise<string>}
 */
RouteParam.prototype.stringify = function (value) {
    return Promise.resolve(String(value));
};

module.exports = RouteParam;
