var RouteTokenStreamWrapper = require('./RouteTokenStreamWrapper');

/**
 * @constructor
 */
function RouteTokenStream(tokens, index, firstToken) {
    this.tokens = tokens;
    this.index = index;
    this.firstToken = typeof firstToken === 'string' ? firstToken : '';
}

/**
 * @returns {string}
 */
RouteTokenStream.prototype.peek = function () {
    return this.firstToken;
};

/**
 * @returns {RouteTokenStream}
 */
RouteTokenStream.prototype.next = function () {
    return new RouteTokenStream(this.tokens, this.index + 1, this.tokens[this.index]);
};

/**
 * @param {number|string} prefix
 * @returns {RouteTokenStream}
 */
RouteTokenStream.prototype.skip = function (prefix) {
    if (typeof prefix === 'string') {
        prefix = prefix.length;
    }
    var firstToken = this.firstToken.substr(prefix);
    if (firstToken.length > 0) {
        return new RouteTokenStream(this.tokens, this.index, firstToken);
    }
    return this.next();
};

/**
 * Returns matched prefix if first token starts with given prefix, null otherwise
 * @param {string|RegExp} prefix
 * @returns {string|null}
 */
RouteTokenStream.prototype.test = function (prefix) {
    if (typeof prefix === 'string') {
        return this.firstToken.length >= prefix.length &&
            this.firstToken.substr(0, prefix.length) === prefix ? prefix : null;
    } else {
        var oldLastIndex = prefix.lastIndex;
        prefix.lastIndex = 0;
        var match = prefix.exec(this.firstToken);
        var result = match !== null && prefix.lastIndex === 0;
        prefix.lastIndex = oldLastIndex;
        return result ? match[0] : null;
    }
};

/**
 * @returns {boolean}
 */
RouteTokenStream.prototype.hasNext = function () {
    return this.index < this.tokens.length;
};

/**
 * @returns {boolean}
 */
RouteTokenStream.prototype.isEmpty = function () {
    return this.firstToken.length === 0;
};

RouteTokenStream.prototype.wrap = function () {
    return new RouteTokenStreamWrapper(this);
};

module.exports = RouteTokenStream;
