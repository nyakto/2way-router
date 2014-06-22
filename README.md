2way-router
===========
> routing plugin for node.js
## Usage
#### Defining routes
```js
var Router = require('2way-router');
var router = new Router();
// you must provide your own controllers
router.route('/')
    .name('main')
    .controller(mainPageController);
router.route('/news')
    .name('news')
    .controller(newsPageController);
router.route('/news/archive/{year ~ /\\d{4}/}-{month ~ /\\d{2}/}-{day ~ /\\d{2}/}/')
    .name('news-archive')
    .controller(newsArchiveController);
router.route('/news/{id:int}')
    .name('news-publication')
    .controller(newsPublicationsController);
```
#### Detecting route
```js
router.findRoute('/news/archive/2014-06-21/').done(function (info) {
    var controller = info.route.controller();
    var params = info.params;
});
```
#### Creating urls
```js
router.url('news-archive', {
    year: 2014,
    month: '06',
    day: 21,
    page: 3
}).done(function (url) {
    // url === '/news/archive/2014-06-21/?page=3'
});
```
#### Full example
You will need to run
```bash
npm install 2way-router express
```
Example application:
```js
var Router = require('2way-router');
var express = require('express');
var router = new Router();

function createPage(name, route) {
    function pageController(req, res, params) {
        res.send(200, 'page: ' + name + ' + params: ' + JSON.stringify(params));
    }

    router.route(route)
        .name(name)
        .controller(pageController);
}

createPage('main', '/');
createPage('news', '/news');
createPage('news-archive', '/news/archive/{year ~ /\\d{4}/}-{month ~ /\\d{2}/}-{day ~ /\\d{2}/}/');
createPage('news-publication', '/news/{id:int}');

var app = express();
app.use(function (req, res) {
    try {
        router.findRoute(req.path).done(function (info) {
            info.route.controller()(req, res, info.params);
        });
    } catch(error) {
        res.send(404, 'Not found');
    }
});
app.listen(8080);
```
