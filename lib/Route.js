var RegExpParam = require('./param/RegExpParam');
var vow = require('vow');

function parseTemplate(router, template) {
    var tokens = [], pos = 0, m, start, token;
    var re = /\{\s*(\w+)\s*:\s*(\w+)\s*}|\/|\{\s*(\w+)\s*~\s*\/((?:\\.|[^\\\/])*)\/\s*}/g;
    while ((m = re.exec(template)) !== null) {
        start = re.lastIndex - m[0].length;
        token = null;
        if (m[0] === '/') {
            if (start > pos) {
                tokens.push(template.substr(pos, start - pos));
            }
            token = '/';
        } else if (m[3]) {
            token = router.createRegExpParam(m[3], m[4], template.substr(pos, start - pos));
        } else {
            token = router.createParam(m[2], m[1], template.substr(pos, start - pos));
        }
        if (token !== null) {
            tokens.push(token);
            pos = re.lastIndex;
        }
    }
    if (pos < template.length) {
        tokens.push(template.substr(pos));
    }
    return tokens;
}

function insertRoute(route) {
    var router = route.router, tokens = route.pathTemplate;
    var map = router.map, i, token;
    for (i = 0; i < tokens.length; ++i) {
        token = tokens[i];
        if (typeof token === 'string') {
            map = map.path(token);
        } else {
            map = map.addMatcher(token);
        }
    }
    map.addRoute(route);
}

/**
 * @param {Router} router
 * @param {string} pathTemplate
 * @constructor
 */
function Route(router, pathTemplate) {
    this._name = null;
    this._controller = null;
    this.router = router;
    this.pathTemplate = parseTemplate(router, pathTemplate);
    this.router.routes.push(this);
    insertRoute(this);
}

Route.prototype.name = function (name) {
    if (typeof name === 'undefined') {
        return this._name;
    }
    if (this._name !== null && this.router.namedRoutes[name] === this) {
        delete this.router.namedRoutes[name];
    }
    this._name = name;
    if (name !== null) {
        this.router.namedRoutes[name] = this;
    }
    return this;
};

Route.prototype.controller = function (controller) {
    if (typeof controller === 'undefined') {
        return this._controller;
    }
    this._controller = controller;
    return this;
};

/**
 * @param {object} [params]
 * @returns {Promise<string>}
 */
Route.prototype.url = function (params) {
    var tokens = this.pathTemplate;
    var index = 0;
    var url = '';
    var usedParams = {};
    params = params || {};

    function createUrl() {
        var name, value, token, first = true;
        while (index < tokens.length) {
            token = tokens[index];
            index++;
            if (typeof token === 'string') {
                url += token;
            } else {
                url += token.prefix;
                name = token.name;
                value = params.hasOwnProperty(name) ? params[name] : null;
                usedParams[name] = true;
                return token.stringify(value).then(function (token) {
                    url += String(token);
                    return createUrl();
                });
            }
        }
        for (name in params) {
            if (params.hasOwnProperty(name) && !usedParams.hasOwnProperty(name) && params[name] !== null) {
                if (first) {
                    first = false;
                    url += '?';
                } else {
                    url += '&';
                }
                url += encodeURIComponent(name) + '=' + encodeURIComponent(params[name]);
            }
        }
        return vow.fulfill(url);
    }

    return createUrl();
};

module.exports = Route;
