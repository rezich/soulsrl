$(document).ready(function() {
	$rle.setup('screen');
	new game();
});

function game() {
	game.current = this;

	this.messages = new messages();
	this.player = null;
	this.current_room = null;

	state.reset();

	state.add(new state_mainMenu());
	//state.add(new state_game());

	//this.commands = game.cmds_game;
	/*this.messages.write("Welcome to SoulsRL!");
	this.current_room = this.generateDungeon();

	// begin temp code
	this.player = new creature();
	this.player.position = { x: 8, y: 8};
	this.player.character = '@';
	for (var t in this.current_room.terrain) {
		this.current_room.terrain[t].draw();
	}
	this.player.draw();
	this.redraw();*/
	// end temp code

	$(document).keydown(game.handleInput);
}

game.current = null;

game._keyTimeout = null;
game._keysEnabled = true;
game._keyRateLimit = 7;

game.viewport_offset = {
	x: 0,
	y: 3
}

game.handleInput = function (event) {
	if (!game.current) {
		alert('no game!');
		return;
	}
	if (state.list.length == 0 ) {
		$rle.put(0, 0, 'no state provided');
		return;
	}
	if (!game._keysEnabled) {
		return false;
	}
	var commands = state.current().keys;
	for (var command in commands) {
		var keys = commands[command].keys;
		if (Object.prototype.toString.call(keys) === '[object Array]') {
			for (var key in keys) {
				if (keys[key] == event.keyCode) {
					commands[command].action();
					game._keysEnabled = false;
					game._keyTimeout = setTimeout(function () { game._keysEnabled = true; }, game._keyRateLimit);
					return false;
				}
			}
		}
		else {
			if (keys == event.keyCode) {
				game._keysEnabled = false;
				game._keyTimeout = setTimeout(function () { game._keysEnabled = true; }, game._keyRateLimit);
				commands[command].action();
				return false;
			}
		}
	}
}

// TODO: GET RID OF THIS
game.blocked = function (x, y) {
	return game.current.current_room.blocked(x, y);
}

// TODO: GET RID OF THIS
game.visit = function (x, y) {
	return game.current.current_room.visit(x, y);
}

game.prototype.preload = function (game_data) {
	// THIS IS SUPER UGLY AND MESSY AND I AM DESERVING OF DEATH FOR WRITING IT
	// BUT IT'S JUST TO TEST OUT LOADING OKAY FINE GOD I'LL FIX IT IN THE FUTURE
	state.add(new state_loading(), { clear: true });
	$.ajax({
		url: 'rooms/PRISON-1.txt',
		dataType: 'text',
		cache: false,
		success: function (data) {
			room.data['PRISON-3'] = data;
			$.ajax({
				url: 'rooms/PRISON-2.txt',
				dataType: 'text',
				cache: false,
				success: function (data) {
					room.data['PRISON-3'] = data;
					$.ajax({
						url: 'rooms/PRISON-3.txt',
						dataType: 'text',
						cache: false,
						success: function (data) {
							room.data['PRISON-3'] = data;
							state.pop();
							state.replace(new state_game(game_data.player_name), { clear: true });
						}
					});
				}
			});
		}
	});
}

game.prototype.init = function (player_name) {
	this.messages.write("Welcome to SoulsRL!");
	this.current_room = this.generateDungeon(room.area.prison, 3);
	this.player = new creature();
	this.player.name = player_name;
	this.player.position = { x: 1, y: 1 };
	this.player.character = '@';
}

game.prototype.redraw_tile = function (position) {
	for (var t in this.current_room.terrain) {
		if (this.current_room.terrain[t].position.x == position.x && this.current_room.terrain[t].position.y == position.y) this.current_room.terrain[t].draw();
	}
}

game.prototype.generateDungeon = function (area, floor) {
	var r = new room(area, floor);

	// TODO: Y'know, procedural stuff :P

	if (!room.data[r.name()]) {
		alert("area data not found!");
		return r;
	}

	var data = room.data[area + '-' + floor].split("\n");

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 80; j++) {
			var kind = terrain.fromChar(data[i].charAt(j));
			if (kind) r.add_terrain({ x: j, y: i }, kind);
		}
	}

	/*for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 80; j++) {
			r.add_terrain({x: j, y: i}, terrain.kind.floor);
		}
	}

	for (var i = 0; i < 10; i++) {
		r.add_terrain({x: 14, y: 4 + i}, terrain.kind.wall);
	}*/

	return r;
}

game.prototype.drawUI = function () {

	// UI line 1
	var name = this.player.name;
	$rle.put(0, 23, name, { fg: $rle.color.system.brightCyan });
	$rle.put(name.length + 1, 23, "HP:", { fg: $rle.color.system.gray });
	var hp = this.player.HP + '/' + this.player.maxHP;
	$rle.put(name.length + 4, 23, hp, { fg: $rle.color.system.red });
	$rle.put(name.length + 5 + hp.length, 23, "STM:", { fg: $rle.color.system.gray });
	var stm = "100%";
	$rle.put(name.length + 9 + hp.length, 23, stm, { fg: $rle.color.system.cyan });

	// UI line 2
	//$rle.put(0, 24, "DLVL:", { fg: $rle.color.system.gray });
	var room_name = game.current.current_room.name();
	$rle.put(0, 24, room_name, { fg: $rle.color.system.cyan });
	$rle.put(1 + room_name.length, 24, "LVL:", { fg: $rle.color.system.gray });
	var lvl = "1";
	$rle.put(5 + room_name.length, 24, lvl, { fg: $rle.color.system.cyan });
	$rle.put(6 + room_name.length + lvl.length, 24, "SOULS:", { fg: $rle.color.system.gray });
	var souls = "100";
	$rle.put(12 + room_name.length + lvl.length, 24, souls, { fg: $rle.color.system.cyan });
	$rle.put(13 + room_name.length + lvl.length + souls.length, 24, 'HUMANITY:', { fg: $rle.color.system.gray });
	var humanity = "0";
	$rle.put(22 + room_name.length + lvl.length + souls.length, 24, humanity, { fg: $rle.color.system.cyan });
}

////
// state - game state machine
////

function state() { }

state.list = [];

state.current = function () {
	if (this.list.length > 0) {
		return this.list[this.list.length - 1];
	}
	else {
		return null;
	}
}

state.add = function (s, options) {
	state.list.push(s);
	if (options) {
		if (options.clear) $rle.clear();
	}
	state.current().first_draw();
	state.current().draw();
}

state.replace = function(s, options) {
	state.list.pop();
	state.add(s, options);
}

state.reset = function () {
	state.list = [];
}

state.pop = function () {
	state.list.pop();
	$rle.clear();
	state.current().first_draw();
	state.current().draw();
}

state.prototype.keys = { }

state.prototype.draw = function () { }

state.prototype.first_draw = function () { }


////
// state_mainMenu - main menu state
////

function state_mainMenu() {
	this.cursor = 0;
}

state_mainMenu.prototype = new state();

state_mainMenu.prototype.keys = {
	north: {
		keys: $rle.keys.arrow_n,
		action: function () { state.current().move_cursor(-1); /* TODO: Find a better way to do this? */ }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () {  }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () {  }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().move_cursor(1); /* TODO: Find a better way to do this? */ }
	},
	confirm: {
		keys: [13],
		action: function () { state.current().confirm(); }
	}
}

state_mainMenu.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 3, " .oooooo..o                       oooo           ooooooooo.   ooooo       ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 4, "d8P'    `Y8                       `888           `888   `Y88. `888'       ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 5, "Y88bo.       .ooooo.  oooo  oooo   888   .oooo.o  888   .d88'  888        ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 6, " `\"Y8888o.  d88' `88b `888  `888   888  d88(  \"8  888ooo88P'   888        ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 7, "     `\"Y88b 888   888  888   888   888  `\"Y88b.   888`88b.     888        ", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 8, "oo     .d8P 888   888  888   888   888  o.  )88b  888  `88b.   888       o", { align: 'center', fg: $rle.color.system.white });
	$rle.put(40, 9, "8\"\"88888P'  `Y8bod8P'  `V88V\"V8P' o888o 8\"\"888P' o888o  o888o o888ooooood8", { align: 'center', fg: $rle.color.system.white });
	$rle.put(52, 3, "ooooooooo.   ooooo       ", { fg: $rle.color.system.red });
	$rle.put(52, 4, "`888   `Y88. `888'       ", { fg: $rle.color.system.red });
	$rle.put(52, 5, " 888   .d88'  888        ", { fg: $rle.color.system.red });
	$rle.put(52, 6, " 888ooo88P'   888        ", { fg: $rle.color.system.red });
	$rle.put(52, 7, " 888`88b.     888        ", { fg: $rle.color.system.red });
	$rle.put(52, 8, " 888  `88b.   888       o", { fg: $rle.color.system.red });
	$rle.put(52, 9, "o888o  o888o o888ooooood8", { fg: $rle.color.system.red });
	$rle.put(40, 21, 'arrows, numpad, vi keys: choose', { fg: $rle.color.system.charcoal, align: 'center' });
	$rle.put(40, 22, 'enter: select', { fg: $rle.color.system.charcoal, align: 'center' });
	$rle.put(40, 24, 'Copyright (C) 2012 Adam Rezich', { fg: $rle.color.system.cyan, align: 'center' });
	for (var i = 0; i < state_mainMenu.entries.length; i++) {
		$rle.put(40, 14 + i, (this.cursor == i ? '> ' : '  ') + state_mainMenu.entries[i].text + (this.cursor == i ? ' <' : '  '), { align: 'center', fg: (this.cursor == i ? $rle.color.system.white : (state_mainMenu.entries[i].disabled ? $rle.color.system.charcoal : $rle.color.system.gray)) });
	}
	$rle.flush();
}

state_mainMenu.prototype.move_cursor = function (amount) {
	do {
		this.cursor += amount;
		if (this.cursor < 0) this.cursor += state_mainMenu.entries.length;
		if (this.cursor > state_mainMenu.entries.length - 1) this.cursor -= state_mainMenu.entries.length;
		this.draw();
	} while (state_mainMenu.entries[this.cursor].disabled);
}

state_mainMenu.prototype.confirm = function () {
	state_mainMenu.entries[this.cursor].action();
}

state_mainMenu.entries = [
	{
		text: "New game",
		action: function () { state.replace(new state_inputName()); }
	},
	{
		text: "Continue",
		disabled: true,
		action: function () {  }
	},
	{
		text: "Settings",
		disabled: true,
		action: function () {  }
	},
	{
		text: "Manual",
		action: function () { state.add(new state_help(), { clear: true }); }
	}
];


////
// state_loading - just a fat loading screen
////

function state_loading(options) {
	this.data = options;
}

state_loading.prototype = new state();

state_loading.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 13, 'L O A D I N G . . .', { align: 'center' });
	$rle.flush();
}


////
// state_help - documentation and such
////

function state_help() { }

state_help.prototype = new state();

state_help.prototype.keys = {
	back: {
		keys: $rle.keys.escape,
		action: function () { state.pop(); }
	}
}

state_help.prototype.draw = function () {
	$rle.clear();
	$rle.put(0, 0, 'SoulsRL documentation');
	$rle.put(0, 2, "lol jk there's no documentation here yet, maybe once there's something to")
	$rle.put(0, 3, "actually play or something.");
	$rle.put(40, 24, "escape: return", { align: 'center', fg: $rle.color.system.charcoal });
	$rle.flush();
}


////
// state_inputName - self-explanatory
////

function state_inputName() {
	this.name = 'Stebbins';
}

state_inputName.prototype = new state();

state_inputName.prototype.keys = {
	a: {
		keys: $rle.keys.a,
		action: function () { state.current().type_char('a'); }
	},
	b: {
		keys: $rle.keys.b,
		action: function () { state.current().type_char('b'); }
	},
	c: {
		keys: $rle.keys.c,
		action: function () { state.current().type_char('c'); }
	},
	d: {
		keys: $rle.keys.d,
		action: function () { state.current().type_char('d'); }
	},
	e: {
		keys: $rle.keys.e,
		action: function () { state.current().type_char('e'); }
	},
	f: {
		keys: $rle.keys.f,
		action: function () { state.current().type_char('f'); }
	},
	g: {
		keys: $rle.keys.g,
		action: function () { state.current().type_char('g'); }
	},
	h: {
		keys: $rle.keys.h,
		action: function () { state.current().type_char('h'); }
	},
	i: {
		keys: $rle.keys.i,
		action: function () { state.current().type_char('i'); }
	},
	j: {
		keys: $rle.keys.j,
		action: function () { state.current().type_char('j'); }
	},
	k: {
		keys: $rle.keys.k,
		action: function () { state.current().type_char('k'); }
	},
	l: {
		keys: $rle.keys.l,
		action: function () { state.current().type_char('l'); }
	},
	m: {
		keys: $rle.keys.m,
		action: function () { state.current().type_char('m'); }
	},
	n: {
		keys: $rle.keys.n,
		action: function () { state.current().type_char('n'); }
	},
	o: {
		keys: $rle.keys.o,
		action: function () { state.current().type_char('o'); }
	},
	p: {
		keys: $rle.keys.p,
		action: function () { state.current().type_char('p'); }
	},
	q: {
		keys: $rle.keys.q,
		action: function () { state.current().type_char('q'); }
	},
	r: {
		keys: $rle.keys.r,
		action: function () { state.current().type_char('r'); }
	},
	s: {
		keys: $rle.keys.s,
		action: function () { state.current().type_char('s'); }
	},
	t: {
		keys: $rle.keys.t,
		action: function () { state.current().type_char('t'); }
	},
	u: {
		keys: $rle.keys.u,
		action: function () { state.current().type_char('u'); }
	},
	v: {
		keys: $rle.keys.v,
		action: function () { state.current().type_char('v'); }
	},
	w: {
		keys: $rle.keys.w,
		action: function () { state.current().type_char('w'); }
	},
	x: {
		keys: $rle.keys.x,
		action: function () { state.current().type_char('x'); }
	},
	y: {
		keys: $rle.keys.y,
		action: function () { state.current().type_char('y'); }
	},
	z: {
		keys: $rle.keys.z,
		action: function () { state.current().type_char('z'); }
	},
	confirm: {
		keys: $rle.keys.enter,
		action: function () { state.current().confirm(); }
	},
	backspace: {
		keys: $rle.keys.backspace,
		action: function () { state.current().delete_char(); }
	}
}

state_inputName.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 11, 'What is your name?', { align: 'center', fg: $rle.color.system.cyan });
	$rle.put(40, 13, this.name, { align: 'center' });
	$rle.put(40 + Math.floor(this.name.length / 2), 13, ' ', { bg: $rle.color.system.white });
	$rle.put(40, 23, 'enter: confirm', { align: 'center', fg: $rle.color.system.charcoal });
	$rle.put(40, 24, 'escape: return', { align: 'center', fg: $rle.color.system.charcoal });
	$rle.flush();
}

state_inputName.prototype.type_char = function (chr) {
	this.name = this.name + ($rle.shift ? chr.toUpperCase() : chr);
	this.draw();
}

state_inputName.prototype.delete_char = function () {
	if (this.name == '') return;
	this.name = this.name.substring(0, this.name.length - 1);
	this.draw();
}

state_inputName.prototype.confirm = function () {
	if (this.name) game.current.preload({ player_name: this.name });
	else {
		$rle.put(40, 15, 'Please try again.', { align: 'center', fg: $rle.color.system.red });
		$rle.flush();
	}
}


////
// state_game - main game state
////

function state_game(player_name) {
	game.current.init(player_name);
}

state_game.prototype = new state();

state_game.prototype.keys = {
	north: {
		keys: $rle.keys.arrow_n,
		action: function () { game.current.player.move($rle.dir.n); state.current().draw(); }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () { game.current.player.move($rle.dir.e); state.current().draw(); }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () { game.current.player.move($rle.dir.w); state.current().draw(); }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { game.current.player.move($rle.dir.s); state.current().draw(); }
	},
	northwest: {
		keys: $rle.keys.arrow_nw,
		action: function () { game.current.player.move($rle.dir.nw); state.current().draw(); }
	},
	northeast: {
		keys: $rle.keys.arrow_ne,
		action: function () { game.current.player.move($rle.dir.ne); state.current().draw(); }
	},
	southwest: {
		keys: $rle.keys.arrow_sw,
		action: function () { game.current.player.move($rle.dir.sw); state.current().draw(); }
	},
	southeast: {
		keys: $rle.keys.arrow_se,
		action: function () { game.current.player.move($rle.dir.se); state.current().draw(); }
	},
	wait: {
		keys: [90, 101],
		action: function () { }
	}
}

state_game.prototype.draw = function () {
	$rle.clear();
	for (var t in game.current.current_room.terrain) {
		game.current.current_room.terrain[t].lit = false;
	}
	fieldOfView(game.current.player.position.x, game.current.player.position.y, game.current.current_room.visibility, game.visit, game.blocked);
	for (var t in game.current.current_room.terrain) {
		game.current.current_room.terrain[t].draw();
	}
	game.current.player.draw();
	game.current.messages.draw();
	game.current.drawUI();
	$rle.flush();
}

state_game.prototype.first_draw = function () {
}


////
// messages - message history
////

function messages() {
	this.reset();
}

messages.prototype.reset = function () {
	this.lines = [];
	this.lastLine = -1;
	this.cleared = false;
}

messages.prototype.write = function (text, options) {
	this.lines.push({ text: text });
}

messages.prototype.draw = function () {
	var diff = this.lines.length - 1 - this.lastLine;
	if (diff == 0) {
		this.clear();
		return;
	}
	if (diff > 0) $rle.put(0, 3 - diff, this.lines[this.lastLine + 1].text);
	if (diff > 1) $rle.put(0, 4 - diff, this.lines[this.lastLine + 2].text);
	if (diff > 2) {
		if (diff > 3) {
		}
		else {
			$rle.put(0, 5 - (this.lines.length - 1 - this.lastLine), this.lines[this.lastLine + 3].text);
		}
	}
	this.lastLine = this.lastLine + Math.min(this.lines.length - 1 - this.lastLine, 3);
}

messages.prototype.clear = function (override) {
	$rle.put(0, 0, '                                                                                ');
	$rle.put(0, 1, '                                                                                ');
	$rle.put(0, 2, '                                                                                ');
}


////
// room - basically, the floor of a roguelike dungeon
////

function room(area, floor) {
	this.terrain = [];
	this.area = area;
	this.floor = floor;
	this.visibility = 10;
}

room.data = {}

room.area = {
	prison: 'PRISON',
	castle: 'CASTLE',
	belltower: 'BELLTOWR',
	sewers: 'SEWERS',
	blight: 'BLIGHT',
	caves: 'CAVES'
};

room.prototype.add_terrain = function (position, kind) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) this.terrain.splice(t, 1);
	}
	this.terrain.push(new terrain({x: position.x, y: position.y}, kind));
}

room.prototype.solid_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t].solid;
	}
	return true;
}

room.prototype.blocks_light_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t].blocks_light;
	}
	return true;
}

room.prototype.terrain_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t];
	}
	return null;
}

room.prototype.visit = function (x, y) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == x && this.terrain[t].position.y == y) {
			this.terrain[t].visited = true;
			this.terrain[t].lit = true;
		}
	}
	return null;
}

room.prototype.blocked = function (x, y) {
	return this.blocks_light_at({ x: x, y: y });
}

room.prototype.name = function (position) {
	return this.area + (this.floor ? '-' + this.floor : '');
}


////
// entity - general-purpose "game object," covers anything that need to be displayed on-screen, pretty much
////

function entity() {
	this.position = { x: 0, y: 0 };
	this.character = '?';
	this.fg = $rle.color.system.white;
	// this.bg - why haven't I implemented this yet?
	this.lit = false;
	this.visited = false; // maybe don't use this?
	this.solid = false;
	this.blocks_light = false;
}

entity.prototype.should_draw = function () {
	return true;
}

entity.prototype.draw = function () {
	if (this.should_draw())	$rle.put(this.position.x + game.viewport_offset.x, this.position.y + game.viewport_offset.y, this.character, { fg: this.fg, bg: this.bg, alpha: (this.lit ? 0 : 0.5) });
}


////
// creature - anything that has hit points, can be killed, etc.
////

function creature() {
	this.maxHP = 1;
	this.HP = this.maxHP;

	this.respawns = true;

	this.lit = true;
}

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
	else {
		if (this == game.current.player) game.current.messages.write("Something is blocking the way.")
	}
}

creature.data = {
	// A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
	//   #                 #             #                
	// a b c d e f g h i j k l m n o p q r s t u v w x y z
	// # #           #   # #             #     #          

	////
	// HOLLOW - decrepit, weak zombies
	////

	hollow: {						// basically naked
		character: 'h'
	},
	hollow_archer: {				// same as hollow, but with a short bow
		character: 'h'
	},
	hollow_sword: {					// lightly armored hollow with a sword
		character: 'h'
	},
	hollow_firebomb: {				// super-annoying enemy that throws firebombs at regular intervals
		character: 'h'
	},


	////
	// UNDEAD - more skeletal-looking than hollow, and actually dangerous
	////

	undead_sword: {					// basically stronger hollow_sword
		character: 'u'
	},
	undead_spear: {					// has a spear and small shield, dangerous early enemy
		character: 'u'
	},
	undead_crossbow: {				// stronger hollow_archer, basically
		character: 'u'
	},
	undead_assassin: {				// throwing knives, counters, and backstabs make this a worthy enemy
		character: 'a'
	},
	undead_dog: {					// fast pack animal, so, super dangerous in groups
		character: 'd'
	},


	////
	// SKELETON - about on par with undead, strength-wise, but a bit more agile
	////

	skeleton_axe: {					// average enemy
		character: 's'
	},
	skeleton_giant: {				// giant four-armed skeleton swordsman
		character: 'S',
		respawns: false
	},


	////
	// KNIGHT - stronger, mostly solo enemies
	////

	knight_sword: {					// burly melee dude
		character: 'k'
	},
	knight_mace: {					// another burly melee dude
		character: 'k'
	},
	knight_black: {					// this guy will rip your shit up
		character: 'K',
		respawns: false
	},


	////
	// JELLY - amorphous blobs of surprise death
	////

	jelly_black: {
		character: 'j'				// lurks in damp and watery areas and attacks with pseudopodia
	},


	////
	// RAT - disgusting, poisonous vermin of varying size and strength
	////

	rat_small: {					// size of a small dog
		character: 'r'
	},
	rat_large: {					// size of a small bear
		character: 'R'
	},


	////
	// MISC - unique creatures without "class groupings"
	////

	basilisk: {						// worst creature in game, will curse you, comes in small groups
		character: 'b'
	},

	butcher: {						// slow, tough solo creature with a butcher's knife and meat hook
		character: 'B',
		respawns: false
	}
}


////
// terrain - static stuff, walls and floors and so forth
////

function terrain(pos, k) {
	this.position = pos;
	this.kind = k;
	switch (k) {
		case terrain.kind.floor:
			this.character = '.';
			this.fg = $rle.color.system.charcoal;
			break;
		case terrain.kind.wall:
			this.character = '#';
			this.fg = $rle.color.system.black;
			this.bg = $rle.color.system.charcoal;
			this.solid = true;
			this.blocks_light = true;
			break;
		case terrain.kind.chasm:
			this.character = ':';
			this.fg = $rle.color.system.cyan;
			this.solid = true;
			break;
		case terrain.kind.door:
			this.character = '+';
			this.fg = $rle.color.system.charcoal;
			this.bg = $rle.color.system.gray;
			this.blocks_light = true;
			break;
		case terrain.kind.water:
			this.character = '~';
			this.fg = $rle.color.system.cyan;
			this.bg = $rle.color.system.blue;
			this.solid = true;
			break;
		case terrain.kind.bridge:
			this.character = '=';
			this.fg = $rle.color.system.black;
			this.bg = $rle.color.system.brown;
			break;
	}
}

terrain.prototype = new entity();

terrain.prototype.should_draw = function () {
	return this.visited;
}

terrain.fromChar = function (chr) {
	switch (chr) {
		case '.': return terrain.kind.floor;
		case '#': return terrain.kind.wall;
		case ':': return terrain.kind.chasm;
		case '+': return terrain.kind.door;
		case '~': return terrain.kind.water;
		case '=': return terrain.kind.bridge;
	}
	return null;
}

terrain.kind = {
	floor: 1,
	wall: 2,
	chasm: 3,
	door: 4,
	water: 5,
	bridge: 6
}