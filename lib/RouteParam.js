/**
 * @constructor
 */
function RouteParam() {
}

/**
 * @param {*} value
 * @returns {string}
 */
RouteParam.prototype.stringify = function (value) {
    return String(value);
};

module.exports = RouteParam;
