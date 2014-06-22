function parseTemplate(router, template) {
    var tokens = [], pos = 0, m, start, token;
    var re = /\{\s*(\w+)\s*:\s*(\w+)\s*}|\//g;
    while ((m = re.exec(template)) !== null) {
        start = re.lastIndex - m[0].length;
        token = null;
        if (m[0] === '/') {
            if (start > pos) {
                tokens.push(template.substr(pos, start - pos));
            }
            token = '/';
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
    this.name = null;
    this.controller = null;
    this.router = router;
    this.pathTemplate = parseTemplate(router, pathTemplate);
    this.router.routes.push(this);
    insertRoute(this);
}

Route.prototype.name = function (name) {
    if (typeof name === 'undefined') {
        return this.name;
    }
    if (this.name !== null && this.router.namedRoutes[name] === this) {
        delete this.router.namedRoutes[name];
    }
    this.name = name;
    if (name !== null) {
        this.router.namedRoutes[name] = this;
    }
    return this;
};

Route.prototype.controller = function (controller) {
    if (typeof controller === 'undefined') {
        return this.controller;
    }
    this.controller = controller;
    return this;
};

module.exports = Route;
