_MULTIPLAYER = false;

$(document).ready(function () {
	$rle.setup('screen');
	$(document).keydown(game.handleInput);
	new game();
	now.ready(function () {
		if (_MULTIPLAYER) {
			state.pop();
			state.current().draw();
		}
	});
});

function game() {
	game.current = this;

	this.messages = new messages();
	this.queued_actions = [];
	this.player = null;
	this.current_room = null;
	this.respawn_room = null;
	this.respawn_position = null;

	this.player_move_history = [];

	this.settings = {
		noob_mode: false
	}

	state.reset();

	state.add(new state_mainMenu());
	if (_MULTIPLAYER) state.add(new state_loading());
}

game.current = null;

game.motd = [
	"Welcome to SoulsRL!",
	"This game is currently in early alpha.",
	"Expect bugs and weirdness.",
	"Prepare to die!"
];

game._keyTimeout = null;
game._keysEnabled = true;
game._keyRateLimit = 10;
game._bloodstainPast = 5;

game.viewport_offset = {
	x: 0,
	y: 3
}

game.roll = function (a, b) {
	if (a && b) {
		// multiplier, die
		var result = 0;
		for (var i = 0; i < a; i++) {
			result += 1 + Math.floor(Math.random() * b);
		}
		return result;
	}
	// die
	return 1 + Math.floor(Math.random() * a);
}

game.reset = function () {
	$rle.clear();
	delete game.current;
	new game();
}

game.handleInput = function (event) {
	window.scroll(0, 0);
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
	var callback = null;
	var ret = true;
	var commands = state.current().keys;
	for (var command in commands) {
		var keys = commands[command].keys;
		if (Object.prototype.toString.call(keys) === '[object Object]') {
			if ((keys.shift && keys.key == event.keyCode && $rle.shift) || (!keys.shift && keys.key == event.keyCode && !$rle.shift)) {
				callback = commands[command].action;
			}
		}
		else if (Object.prototype.toString.call(keys) === '[object Array]') {
			for (var key in keys) {
				if (Object.prototype.toString.call(keys[key]) === '[object Object]') {
					if ((keys[key].shift && keys[key].key == event.keyCode && $rle.shift) || (!keys[key].shift && keys[key].key == event.keyCode && !$rle.shift)) {
						callback = commands[command].action;
					}
				}
				else if (keys[key] == event.keyCode && !$rle.shift) {
					callback = commands[command].action;
				}
			}
		}
		else {
			if (keys == event.keyCode && !$rle.shift) {
				callback = commands[command].action;
			}
		}
		if (callback) break;
	}

	if (callback) {
		callback();
		return false;
	}

	// Just so you don't accidentally go back or scroll the page
	switch (event.keyCode) {
		case $rle.keys.backspace:
		case $rle.keys.arrow_e[0]:
		case $rle.keys.arrow_n[0]:
		case $rle.keys.arrow_w[0]:
		case $rle.keys.arrow_s[0]:
		case $rle.keys.space:
			return false;
	}
	return true;
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
	for (var i = 0; i < game.motd.length; i++) {
		this.messages.write(game.motd[i]);
	}
	this.current_room = this.generateDungeon(room.area.prison, 3);
	this.init_player(player_name);
	for (var i = 0; i < game._bloodstainPast; i++) this.player_move_history.push({ x: this.player.position.x, y: this.player.position.y, room: this.current_room });
	this.current_room.creatures.push(this.player);
	this.respawn_room = this.current_room;
	this.respawn_position = { x: this.player.position.x, y: this.player.position.y };
}

game.prototype.init_player = function (name) {
	this.player = new creature({ x: 1, y: 1 }, this.current_room, creature.data.player);
	if (_MULTIPLAYER) now.updatePlayer(this.player.position.x, this.player.position.y, game.current.current_room.name);
	this.player.name = name;
}

game.prototype.update = function () {
	game._keysEnabled = false;
	var _beginning = Date.now();
	state.current().update();
	var _end = Date.now();
	game._keyTimeout = setTimeout(function () { game._keysEnabled = true; }, game._keyRateLimit - (_end - _beginning));
}

game.prototype.redraw_tile = function (position) {
	for (var t in this.current_room.terrain) {
		if (this.current_room.terrain[t].position.x == position.x && this.current_room.terrain[t].position.y == position.y) this.current_room.terrain[t].draw();
	}
}

game.prototype.generateDungeon = function (area, floor) {
	var r = new room(area, floor);

	// TODO: Y'know, procedural stuff :P

	if (!room.data[r.name]) {
		alert("area data not found!");
		return r;
	}

	var data = room.data[area + '-' + floor].split("\n");

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 80; j++) {
			var kind = terrain.fromChar(data[i].charAt(j));
			if (kind) r.add_terrain({ x: j, y: i }, kind);
			// TODO: REMOVE AFTER TESTING IS COMPLETE
			if (data[i].charAt(j) == '*') {
				r.add_terrain({ x: j, y: i }, terrain.data.floor);
				r.add_creature({ x: j, y: i }, creature.data.hollow_unarmed);
			}
		}
	}

	return r;
}

game.prototype.drawUI = function () {

	// UI line 1
	var name = this.player.name;
	$rle.put(0, 23, name, { fg: $rle.color.system.brightCyan });

	$rle.put(name.length + 1, 23, "HP:", { fg: $rle.color.system.gray });
	var hp = this.player.HP + '/' + this.player.maxHP;
	$rle.put(12, 23, hp, { fg: $rle.color.system.red });

	$rle.put(20, 23, "STM:", { fg: $rle.color.system.gray });
	var stm = "100/100";
	$rle.put(24, 23, stm, { fg: $rle.color.system.cyan });

	$rle.put(32, 23, 'HUM:', { fg: $rle.color.system.gray });
	var humanity = this.player.humanity.toString();
	$rle.put(36, 23, humanity, { fg: $rle.color.system.cyan });

	$rle.put(39, 23, 'ATK:', { fg: $rle.color.system.gray });
	var dice = game.current.player.attack_dice;
	var attack_dice = (dice.multiplier > 1 ? dice.multiplier.toString() : '') + 'd' + dice.die + (dice.bonus < 0 ? dice.bonus.toString() : '') + (dice.bonus > 0 ? '+' + dice.bonus.toString() : '');
	$rle.put(43, 23, attack_dice, { fg: $rle.color.system.cyan });


	// UI line 2
	var room_name = game.current.current_room.name;
	$rle.put(0, 24, room_name, { fg: $rle.color.system.cyan });

	$rle.put(9, 24, "LV:", { fg: $rle.color.system.gray });
	var lvl = this.player.level.toString();
	$rle.put(12, 24, lvl, { fg: $rle.color.system.cyan });

	$rle.put(18, 24, "SOULS:", { fg: $rle.color.system.gray });
	var souls = this.player.souls.toString();
	$rle.put(24, 24, souls, { fg: $rle.color.system.cyan });

	if (this.player.has_estus) {
		$rle.put(32, 24, "EST:", { fg: $rle.color.system.gray });
		var estus = this.player.estus.toString();
		$rle.put(36, 24, estus, { fg: $rle.color.system.cyan });
	}
}


////
// messages - message history
////

function messages() {
	this.reset();
}

messages.prototype = {
	get logs() {
		var msg = '';
		var q = '';
		var m = 1;
		for (var i in this.lines) {
			if (this.lines[i].text == q) {
				m++;
			}
			else {
				msg += '\n' + q + (m > 1 ? ' (x' + m + ')' : '');
				q = this.lines[i].text;
				m = 1;
			}
		}
		msg += '\n' + q + (m > 1 ? ' (x' + m + ')' : '');
		msg = msg.substring(2);
		return msg;
	}
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
	/*if (diff > 0) $rle.put(0, 3 - diff, this.lines[this.lastLine + 1].text);
	if (diff > 1) $rle.put(0, 4 - diff, this.lines[this.lastLine + 2].text);
	if (diff > 2) {
		if (diff > 3) {
			$rle.put(0, 5 - (this.lines.length - 1 - this.lastLine), this.lines[this.lastLine + 3].text + ' [MORE]');
		}
		$rle.put(0, 5 - (this.lines.length - 1 - this.lastLine), this.lines[this.lastLine + 3].text);
	}*/
	if (diff == 1) {
		$rle.put(0, 2, this.lines[this.lastLine + 1].text);
	}
	if (diff == 2) {
		$rle.put(0, 1, this.lines[this.lastLine + 1].text);
		$rle.put(0, 2, this.lines[this.lastLine + 2].text);
	}
	if (diff > 2) {
		$rle.put(0, 0, this.lines[this.lastLine + 1].text);
		$rle.put(0, 1, this.lines[this.lastLine + 2].text);
		$rle.put(0, 2, this.lines[this.lastLine + 3].text + (diff > 3 ? ' [MORE]' : ''));
	}
	if (diff > 3) {
		state.add(new state_more(function () {
			$rle.flush();
		}));
	}
	this.lastLine = this.lastLine + Math.min(this.lines.length - 1 - this.lastLine, 3);
}

messages.prototype.clear = function (override) {
	$rle.put(0, 0, '                                                                                ');
	$rle.put(0, 1, '                                                                                ');
	$rle.put(0, 2, '                                                                                ');
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
	this.room = null;
}

entity.prototype.should_draw = function () {
	return true;
}

entity.prototype.draw = function () {
	if (this.should_draw())	$rle.put(this.position.x + game.viewport_offset.x, this.position.y + game.viewport_offset.y, this.character, { fg: this.fg, bg: this.bg, alpha: (this.lit ? 0 : 0.5) });
}

entity.prototype.update = function () {}

now.drawPlayers = function (players) {
	if (!_MULTIPLAYER) return;
	game.current.current_room.players.length = 0;
	for (var i in players) {
		if (i != now.core.clientId) {
			game.current.current_room.players.push(new creature({ x: players[i].x, y: players[i].y }, game.current.current_room, creature.data.ghost));
		}
	}
	if (state.current().in_game) {
		state.current().draw_partial();
		$rle.flush();
	}
}