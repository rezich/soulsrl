var url = require('url');

var html = require('fs').readFileSync(__dirname+'/index.html');
var css = require('fs').readFileSync(__dirname+'/style.css');
var engine = require('fs').readFileSync(__dirname+'/engine.js');
var game = require('fs').readFileSync(__dirname+'/game.js');
var fov = require('fs').readFileSync(__dirname+'/fov.js');
var jquery = require('fs').readFileSync(__dirname+'/jquery-1.7.1.min.js');
var server = require('http').createServer(function(req, res) {
	switch(url.parse(req.url).pathname) {
		case '/': res.end(html); break;
		case '/style.css': res.end(css); break;
		case '/jquery-1.7.1.min.js': res.end(jquery); break;
		case '/fov.js': res.end(fov); break;
		case '/engine.js': res.end(engine); break;
		case '/game.js': res.end(game); break;
		default: res.end(""); break;
	}
});
server.listen(1337);

var nowjs = require("now");
var everyone = nowjs.initialize(server);