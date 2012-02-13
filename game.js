$(document).ready(function() {
	$rle.setup();
	new game();
});

function game() {
	game.current = this;
	this.current_room = this.generateDungeon();
	this.player = new creature();
	this.player.position = { x: 8, y: 8};
	this.player.character = '@';
	for (var t in this.current_room.terrain) {
		this.current_room.terrain[t].draw();
	}
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
		action: function () { game.current.player.move($rle.dir.n); }
	},
	east: {
		keys: [39, 76, 102],
		action: function () { game.current.player.move($rle.dir.e); }
	},
	west: {
		keys: [37, 72, 100],
		action: function () { game.current.player.move($rle.dir.w); }
	},
	south: {
		keys: [40, 74, 98],
		action: function () { game.current.player.move($rle.dir.s); }
	},
	northwest: {
		keys: [89, 103],
		action: function () { game.current.player.move($rle.dir.nw); }
	},
	northeast: {
		keys: [85, 105],
		action: function () { game.current.player.move($rle.dir.ne); }
	},
	southwest: {
		keys: [66, 97],
		action: function () { game.current.player.move($rle.dir.sw); }
	},
	southeast: {
		keys: [78, 99],
		action: function () { game.current.player.move($rle.dir.se); }
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
	/*for (var t in this.current_room.terrain) {
		//this.current_room.terrain[t].draw();
	}*/
	this.player.draw();
	this.drawUI();
}

game.prototype.redraw_tile = function (position) {
	for (var t in this.current_room.terrain) {
		if (this.current_room.terrain[t].position.x == position.x && this.current_room.terrain[t].position.y == position.y) this.current_room.terrain[t].draw();
	}
}

game.prototype.generateDungeon = function () {
	var r = new room();

	// TODO: Y'know, procedural stuff :P

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 80; j++) {
			r.add_terrain({x: j, y: i}, terrain.kind.floor);
		}
	}

	for (var i = 0; i < 10; i++) {
		r.add_terrain({x: 14, y: 4 + i}, terrain.kind.wall);
	}

	return r;
}

game.prototype.drawUI = function () {
	$rle.put(0, 0, "console line one");
	$rle.put(0, 1, "console line two");
	$rle.put(0, 2, "console line three");

	// UI line 1
	var name = "Adam";
	$rle.put(0, 23, name, { fg: $rle.color.brightCyan });
	$rle.put(name.length + 1, 23, "HP:", { fg: $rle.color.gray });
	var hp = "10/10";
	$rle.put(name.length + 4, 23, hp, { fg: $rle.color.red });
	$rle.put(name.length + 5 + hp.length, 23, "STM:", { fg: $rle.color.gray });
	var stm = "100%";
	$rle.put(name.length + 9 + hp.length, 23, stm, { fg: $rle.color.cyan });

	// UI line 2
	$rle.put(0, 24, "DLVL:", { fg: $rle.color.gray });
	var dlvl = "0";
	$rle.put(5, 24, dlvl, { fg: $rle.color.white });
	$rle.put(6 + dlvl.length, 24, "LVL:", { fg: $rle.color.green });
	var lvl = "1";
	$rle.put(10 + dlvl.length, 24, lvl, { fg: $rle.color.brightGreen });
	$rle.put(11 + dlvl.length + lvl.length, 24, "NXT:", { fg: $rle.color.green });
	var nxt = "100";
	$rle.put(15 + dlvl.length + lvl.length, 24, nxt, { fg: $rle.color.brightGreen });
}


////
// room - basically, the floor of a roguelike dungeon
////

function room() {
	this.terrain = [];
}

room.prototype.add_terrain = function (position, kind) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) this.terrain.splice(t, 1);
	}
	this.terrain.push(new terrain(position, kind));
}

room.prototype.solid_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t].solid;
	}
	return true;
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

creature.prototype.move = function (direction) {
	var endpos = { x: this.position.x, y: this.position.y };
	var lastpos = { x: this.position.x, y: this.position.y };
	switch (direction) {
		case $rle.dir.e:
			endpos.x++;
			break;
		case $rle.dir.ne:
			endpos.x++;
			endpos.y--;
			break;
		case $rle.dir.n:
			endpos.y--;
			break;
		case $rle.dir.nw:
			endpos.x--;
			endpos.y--;
			break;
		case $rle.dir.w:
			endpos.x--;
			break;
		case $rle.dir.sw:
			endpos.x--;
			endpos.y++;
			break;
		case $rle.dir.s:
			endpos.y++;
			break;
		case $rle.dir.se:
			endpos.x++;
			endpos.y++;
			break;
	}
	if (!game.current.current_room.solid_at(endpos)) {
		this.position = endpos;
		game.current.redraw_tile(lastpos);
		this.draw();
	}
}


////
// terrain - static stuff, walls and floors and so forth
////

function terrain(pos, k) {
	this.position = pos;
	this.kind = k;
	this.solid = false;
	switch (k) {
		case terrain.kind.floor:
			this.character = '.';
			this.fg = $rle.color.charcoal;
			this.solid = false;
			break;
		case terrain.kind.wall:
			this.character = '#';
			this.fg = $rle.color.gray;
			this.solid = true;
			break;
	}
}

terrain.prototype = new entity();

terrain.kind = {
	floor: 0,
	wall: 1
}
