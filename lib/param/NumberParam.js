var RouteParam = require('../RouteParam');
var Promise = require('promise');

/**
 * @param {string} name
 * @param {string} prefix
 * @constructor
 */
function NumberParam(name, prefix) {
    this.name = name;
    this.prefix = prefix;
}
NumberParam.prototype = new RouteParam();
NumberParam.prototype.constructor = NumberParam;

/**
 * @param {RouteTokenStreamWrapper} stream
 * @returns {Promise<number>}
 */
NumberParam.prototype.parse = function (stream) {
    var value = stream.read(/\d+/);
    return value === null ? Promise.reject() : Promise.resolve(parseInt(value, 10));
};

module.exports = NumberParam;
