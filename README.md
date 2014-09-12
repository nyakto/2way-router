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
npm install 2way-router express promise
```
Example application:
```js
var Router = require('2way-router');
var Promise = require('promise');
var express = require('express');
var router = new Router();
var links = [
	{
		page: 'main',
		text: 'main page'
	},
	{
		page: 'news',
		text: 'news page'
	},
	{
		page: 'news-archive',
		text: 'news archive for today',
		params: {
			year: new Date().getFullYear(),
			month: pad(new Date().getMonth() + 1, 2),
			day: pad(new Date().getDate(), 2)
		}
	}
];

function pad(value, length) {
	value = String(value);
	while (value.length < length) {
		value = '0' + value;
	}
	return value;
}

function createPage(name, route) {
    function pageController(req, res, params) {
		var pageContent = 'page: ' + name + ', params: <pre>' + JSON.stringify(params.merge(), null, '  ') + '</pre>';
		Promise.all(links.map(function (link) {
			return router.url(link.page, link.params || {});
		})).then(function (urls) {
			pageContent += '<ul>';
			urls.forEach(function (href, index) {
				pageContent += '<li><a href="' + href + '">' + links[index].text + '</a></li>';
			});
			pageContent += '</ul>';
			res.status(200).send(pageContent);
		});
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
	router.findRoute(req.url).then(function (info) {
		info.route.controller()(req, res, info.params);
	}, function () {
		res.status(404).send('Not found');
	});
});
app.listen(8080);
```

#### API
##### Router

```router.route(pathTemplate)``` - creates new ```Route```

```router.findRoute(url, [options])``` - searchs for matching route, returns ```Promise<Route>```

```router.url(routeName, [params])``` - creates url for route with name *routeName*, returns ```Promise<string>```

```router.registerType(typeConstructor, names)``` - registers new param type for further usage in routes, must be called before any ```router.route``` calls, type example can be found at [NumberParam.js]

[NumberParam.js]: lib/param/NumberParam.js

##### Route

```route.name([newName])``` - get/set route name

```route.controller([newController])``` - get/set route controller

```route.url([params])``` - creates url for this route, returns ```Promise<string>```

```route.setDefaultParams(params)``` - set default params for this route

##### RouteParams

```params.getRouteParam(name, [defaultValue=null])``` - get route param value (for example ```id``` in route ```"/news/{id:int}/"```)

```params.getQueryParam(name, [defaultValue=null])``` - get query string param with given *name* (last one if many are present), returns ```string```

```params.getQueryParamValues(name)``` - get all values for query string param with given *name*, returns ```string[]```

