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
				//console.log('%s - %s', req.url, res.message);
			}
		});
	});
});

httpServer.listen(process.env.PORT || 3000);

var nowjs = require("now");
var everyone = nowjs.initialize(httpServer);

var players = [];
nowjs.on('connect', function () {
	players[this.user.clientId] = { x: 1, y: 1, room: null };
})

nowjs.on('disconnect', function () {
	for (var i in players) {
		if (i == this.user.clientId) {
			delete players[i];
			break;
		}
	}
});

everyone.now.updatePlayer = function (x, y, room) {
	players[this.user.clientId].x = x;
	players[this.user.clientId].y = y;
	players[this.user.clientId].room = room;
	var toUpdate = {};
	for (var i in players) {
		if (players[i].room == room) {
			// TODO: limit this to only some players or something
			toUpdate[i] = { x: players[i].x, y: players[i].y };
		}
	}
	if (Object.keys(toUpdate).length < 2) return;
	for (var i in toUpdate) {
		nowjs.getClient(i, function (err) {
			this.now.drawPlayers(toUpdate);
		});
	}
}