$(document).ready(function() {
	$rle.setup();
	new game();
});

function game() {
	game.current = this;
	this.current_room = this.generateDungeon();
	this.player = new creature();
	this.redraw();
	$(document).keydown(game.current.handleInput);
}

game.current = null;

game.viewport_offset = {
	x: 0,
	y: 3
}

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
	//$rle.put(game.current.player.position.x, game.current.player.position.y, '@', {fg: $rle.color.white});
	for (var t in this.current_room.terrain) {
		this.current_room.terrain[t].draw();
	}
	this.drawUI();
}

game.prototype.generateDungeon = function () {
	var r = new room();

	// TODO: y'know, procedural stuff

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 80; j++) {
			r.terrain.push(new terrain({x: j, y: i}, terrain.kind.floor));
		}
	}

	return r;
}

game.prototype.drawUI = function () {
	$rle.put(0, 0, "console line one");
	$rle.put(0, 1, "console line two");
	$rle.put(0, 2, "console line three");
	var name = "Adam";
	$rle.put(0, 23, name, { fg: $rle.color.brightCyan });
	$rle.put(name.length + 1, 23, "HP:")
	var hp = "10/10"
}


////
// room - basically, the floor of a roguelike dungeon
////

function room() {
	this.terrain = [];
}


////
// entity - general-purpose "game object," covers anything that need to be displayed on-screen, pretty much
////

function entity() {
	this.position = { x: 0, y: 0 };
	this.character = '?';
	this.fg = $rle.color.white;
}

entity.prototype.draw = function () {
	$rle.put(this.position.x + game.viewport_offset.x, this.position.y + game.viewport_offset.y, this.character, { fg: this.fg });
}


////
// creature - anything that has hit points, can be killed, etc.
////

function creature() { }

creature.prototype = new entity();


////
// terrain - static stuff, walls and floors and so forth
////

function terrain(pos, k) {
	this.position = pos;
	this.kind = k;
	switch (k) {
		case terrain.kind.floor:
			this.character = '.';
			this.fg = $rle.color.charcoal;
			break;
	}
}

terrain.kind = {
	floor: 0,
	wall: 1
}

terrain.prototype = new entity();