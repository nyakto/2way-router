var vow = require('vow');

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
    return vow.fulfill(String(value));
};

module.exports = RouteParam;
