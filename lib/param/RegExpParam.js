var RouteParam = require('../RouteParam');
var vow = require('vow');

/**
 * @constructor
 */
function RegExpParam(name, prefix, pattern) {
    this.name = name;
    this.prefix = prefix;
    this.pattern = new RegExp(pattern);
}
RegExpParam.prototype = new RouteParam();
RegExpParam.prototype.constructor = RegExpParam;

/**
 * @param {RouteTokenStreamWrapper} stream
 * @returns {Promise<string>}
 */
RegExpParam.prototype.parse = function (stream) {
    var value = stream.read(this.pattern);
    return value === null ? vow.reject() : vow.fulfill(value);
};

module.exports = RegExpParam;
