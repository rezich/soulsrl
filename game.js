$(document).ready(function() {
	$rle.setup();
	$rle.draw_box(4, 4, 8, 8);
	new game();
});

function game() {
	game.current = this;
	this.player = new creature();
	this.redraw();
	$(document).keydown(game.current.handleInput);
}

game.current = null;

// obviously, all the code in these "actions" will be moved to a function in a bit; this was just to test that it works
game.commands = {
	north: {
		keys: [38, 75, 104],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.y--; game.current.redraw(); }
	},
	east: {
		keys: [39, 76, 102],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.x++; game.current.redraw(); }
	},
	west: {
		keys: [37, 72, 100],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.x--; game.current.redraw(); }
	},
	south: {
		keys: [40, 74, 98],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.y++; game.current.redraw(); }
	},
	northwest: {
		keys: [89, 103],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.x--; game.current.player.position.y--; game.current.redraw(); }
	},
	northeast: {
		keys: [85, 105],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.x++; game.current.player.position.y--; game.current.redraw(); }
	},
	southwest: {
		keys: [66, 97],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.x--; game.current.player.position.y++; game.current.redraw(); }
	},
	southeast: {
		keys: [78, 99],
		action: function () { $rle.clear(game.current.player.position.x, game.current.player.position.y); game.current.player.position.x++; game.current.player.position.y++; game.current.redraw(); }
	},
	wait: {
		keys: [90, 101],
		action: function () { }
	}
}

game.prototype.handleInput = function (e) {
	for (var command in game.commands) {
		var keys = game.commands[command].keys;
		for (var key in keys) {
			if (keys[key] == e.keyCode) {
				//alert("the command you want is: " + command);
				game.commands[command].action();
				return false;
			}
		}
	}
}

game.prototype.redraw = function () {
	$rle.put(game.current.player.position.x, game.current.player.position.y, '@', {fg: $rle.color.white});
}

game.prototype.generateDungeon = function () {
	
}


////
// entity - general-purpose "game object," covers anything that need to be displayed on-screen, pretty much
////

function entity() {
	this.position = { x: 0, y: 0 };
}


////
// creature - anything that has hit points, can be killed, etc.
////

function creature() { }

creature.prototype = new entity();


////
// terrain - static stuff, walls and floors and so forth
////

function terrain() { }

terrain.prototype = new entity();