var static = require('node-static');
var http = require('http');
var util = require('util');
var webroot = './public';
var file = new (static.Server)(webroot, {
	cache: 600
});
var httpServer = http.createServer(function (req, res) {
	req.addListener('end', function () {
		file.serve(req, res, function (err, result) {
			if (err) {
				console.error('Error serving %s - %s', req.url, err.message);
				if (err.status === 404 || err.status === 500) {
					file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
				}
				else {
					res.writeHead(err.status, err.headers);
					res.end();
				}
			}
			else {
				console.log('%s - %s', req.url, res.message);
			}
		});
	});
});

httpServer.listen(process.env.PORT || 3000);

var nowjs = require("now");
var everyone = nowjs.initialize(httpServer);