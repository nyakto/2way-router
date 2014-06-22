/**
 * @param {RouteTokenStream} tokenStream
 * @constructor
 */
function RouteTokenStreamWrapper(tokenStream) {
    this.tokenStream = tokenStream;
}

/**
 * @returns {RouteTokenStream}
 */
RouteTokenStreamWrapper.prototype.getTokenStream = function () {
    return this.tokenStream;
};

/**
 * @returns {string}
 */
RouteTokenStreamWrapper.prototype.peek = function () {
    return this.tokenStream.peek();
};

/**
 * @returns {string}
 */
RouteTokenStreamWrapper.prototype.shift = function () {
    var result = this.tokenStream.peek();
    this.tokenStream = this.tokenStream.next();
    return result;
};

/**
 * @param {string|number} prefix
 */
RouteTokenStreamWrapper.prototype.skip = function (prefix) {
    this.tokenStream = this.tokenStream.skip(prefix);
};

/**
 * @param {string|RegExp} prefix
 * @returns {string|null}
 */
RouteTokenStreamWrapper.prototype.test = function (prefix) {
    return this.tokenStream.test(prefix);
};

/**
 * @param {string|RegExp} prefix
 * @returns {string|null}
 */
RouteTokenStreamWrapper.prototype.read = function (prefix) {
    var result = this.tokenStream.test(prefix);
    if (result !== null) {
        this.tokenStream = this.tokenStream.skip(result.length);
    }
    return result;
};

module.exports = RouteTokenStreamWrapper;
