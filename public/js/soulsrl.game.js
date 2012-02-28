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
	this.init_player(player_name);
}

game.prototype.init_player = function(name) {
	this.player = new creature({ x: 1, y: 1 }, creature.data.player);
	this.player.name = name;
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
			// TODO: REMOVE AFTER TESTING IS COMPLETE
			if (data[i].charAt(j) == '*') {
				r.add_terrain({ x: j, y: i }, terrain.data.floor);
				r.add_creature({ x: j, y: i }, creature.data.hollow_unarmed);
			}
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
	var room_name = game.current.current_room.name();
	$rle.put(0, 24, room_name, { fg: $rle.color.system.cyan });
	$rle.put(1 + room_name.length, 24, "LVL:", { fg: $rle.color.system.gray });
	var lvl = this.player.level.toString();
	$rle.put(5 + room_name.length, 24, lvl, { fg: $rle.color.system.cyan });
	$rle.put(6 + room_name.length + lvl.length, 24, "SOULS:", { fg: $rle.color.system.gray });
	var souls = this.player.souls.toString();
	$rle.put(12 + room_name.length + lvl.length, 24, souls, { fg: $rle.color.system.cyan });
	$rle.put(13 + room_name.length + lvl.length + souls.length, 24, 'HUM:', { fg: $rle.color.system.gray });
	var humanity = this.player.humanity.toString();
	$rle.put(17 + room_name.length + lvl.length + souls.length, 24, humanity, { fg: $rle.color.system.cyan });
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
	this.creatures = [];
	this.area = area;
	this.floor = floor;
	this.visibility = 10;
}

room.prototype = {
	get entities() {
		return this.terrain.concat(this.creatures);
	}
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
	this.terrain.push(new terrain({ x: position.x, y: position.y }, kind));
}

room.prototype.add_creature = function (position, data) {
	this.creatures.push(new creature({ x: position.x, y: position.y }, data));
}

room.prototype.solid_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t].solid;
	}
	return true;
}

room.prototype.blocks_light_at = function (position) {
	var blocks = false;
	var anything = false;
	var ents = this.entities;
	for (var i in ents) {
		if (ents[i].position.x == position.x && ents[i].position.y == position.y) {
			anything = true;
			blocks = blocks || ents[i].blocks_light;
		}
	}
	if (anything) return blocks;
	return true;
}

room.prototype.terrain_at = function (position) {
	for (var t in this.terrain) {
		if (this.terrain[t].position.x == position.x && this.terrain[t].position.y == position.y) return this.terrain[t];
	}
	return null;
}

room.prototype.visit = function (x, y) {
	var ents = this.entities;
	for (var i in ents) {
		if (ents[i].position.x == x && ents[i].position.y == y) {
			ents[i].visited = true;
			ents[i].lit = true;
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

function creature(pos, data) {
	this.position = pos;

	this.maxHP = 1;
	this.souls = 0;

	this.respawns = true;

	// TODO: Improve this copy code if creature data is ever going to
	// contain arrays or objects that'll be modified in the copy

	if (data) {
		for (var key in data) {
        	this[key] = data[key];
    	}
	}
	
	this.HP = this.maxHP;
}

creature.prototype = new entity();

creature.prototype.should_draw = function () {
	return this.lit;
}

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
	var ter = game.current.current_room.terrain_at(endpos);
	if (ter) {
		if (ter.solid) {
			ter.interact_with(this);
			this.draw();
			return;
		}
		if (ter.interact_with(this)) {
			this.position = endpos;
			game.current.redraw_tile(lastpos);
			this.draw();
		}
	}
	else {
		terrain.path_blocked();
		return;
	}
}

creature.behavior = {
	none: {},
	basic_melee: {},
	basic_ranged: {},
	firebomber: {}
}

creature.data = {
	// A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
	//   #                 #             #                
	// a b c d e f g h i j k l m n o p q r s t u v w x y z
	// # #           #   # #             #     #          

	////
	// HOLLOW - decrepit, weak zombies
	////

	hollow_unarmed: {				// undead, decrepit, just stands around and waits to be killed
		character: 'h',
		behavior: creature.behavior.none,
		souls: 20
	},
	hollow_archer: {				// early ranged enemy
		character: 'h',
		behavior: creature.behavior.basic_ranged,
		souls: 20
	},
	hollow_sword: {					// lightly armored hollow with a sword
		character: 'h',
		behavior: creature.behavior.basic_melee,
		souls: 20
	},
	hollow_firebomb: {				// super-annoying enemy that throws firebombs at regular intervals
		character: 'h',
		behavior: creature.behavior.firebomber,
		souls: 20
	},


	////
	// UNDEAD - more skeletal-looking than hollow, and actually dangerous
	////

	undead_sword: {					// basically stronger hollow_sword
		character: 'u',
		behavior: creature.behavior.basic_melee,
		souls: 50
	},
	undead_spear: {					// has a spear and small shield, dangerous early enemy
		character: 'u',
		behavior: creature.behavior.basic_melee,
		souls: 50
	},
	undead_crossbow: {				// stronger hollow_archer, basically
		character: 'u',
		behavior: creature.behavior.basic_ranged,
		souls: 50,
	},
	undead_assassin: {				// throwing knives, counters, and backstabs make this a worthy enemy
		character: 'a',
		behavior: creature.behavior.rogue,
		souls: 100
	},
	undead_dog: {					// fast pack animal, so, super dangerous in groups
		character: 'd',
		behavior: creature.behavior.basic_melee,
		souls: 100
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
	},


	////
	// PLAYER - durr, it's the player
	////

	player: {
		character: '@',
		maxHP: 10,
		level: 1,
		XP: 0,
		humanity: 0,
		lit: true
	}
}


////
// terrain - static stuff, walls and floors and so forth
////

function terrain(pos, data) {
	this.position = pos;

	// TODO: Improve this copy code if terrain data is ever going to
	// contain arrays or objects that'll be modified in the copy

	if (data) {
		for (var key in data) {
        	this[key] = data[key];
    	}
	}
	// fuck yes this is so awesome that it works it makes me want to
	// explode with happiness and joy
	if (this.interact) this.interact.bind(this);
}

terrain.prototype = new entity();

terrain.prototype.should_draw = function () {
	return this.visited;
}

terrain.prototype.interact_with = function (activator) {
	// return false to override movement
	if (this.interact) {
		return this.interact(activator);
	}
	else {
		return true;
	}
}

terrain.fromChar = function (chr) {
	switch (chr) {
		case '.': return terrain.data.floor;
		case '#': return terrain.data.wall;
		case ':': return terrain.data.chasm;
		case '+': return terrain.data.door;
		case '~': return terrain.data.water;
		case '=': return terrain.data.bridge;
	}
	return null;
}

terrain.generic_solid_collision = function (ent, activator) {
	return terrain.solid_message(ent, activator, 'Something is blocking the way.');
}

terrain.solid_message = function (ent, activator, player_msg, nonplayer_msg) {
	if (activator == game.current.player && player_msg) game.current.messages.write(player_msg);
	if (activator != game.current.player && nonplayer_msg) game.current.messages.write(nonplayer_msg);
	return false;
}

terrain.nonsolid_message = function (ent, activator, player_msg, nonplayer_msg) {
	terrain.solid_message(ent, activator, player_msg, nonplayer_msg);
	return true;
}

terrain.use_door = function (ent, activator, open) {
	if (open && !ent.open) {
		ent.open = true;
		ent.solid = false;
		ent.character = '\\';
		ent.blocks_light = false;
		if (activator == game.current.player) {
			game.current.messages.write('You open the door.');
		}
		else {
			game.current.messages.write('Something somehow opened a door.');
		}
		return true;
	}
	else return true;
}

terrain.data = {
	floor: {
		character: '.',
		fg: $rle.color.system.charcoal
	},
	wall: {
		character: '#',
		fg: $rle.color.system.black,
		bg: $rle.color.system.charcoal,
		solid: true,
		blocks_light: true,
		interact: function (activator) { return terrain.generic_solid_collision(this, activator); }
	},
	chasm: {
		character: ':',
		fg: $rle.color.system.cyan,
		solid: true,
		interact: function (activator) { return terrain.solid_message(this, activator, 'The chasm appears to go on forever. Descending it would be a bad idea.'); }
	},
	door: {
		character: '+',
		fg: $rle.color.system.charcoal,
		bg: $rle.color.system.gray,
		blocks_light: true,
		solid: true,
		open: false,
		interact: function (activator) { return terrain.use_door(this, activator, true); }
	},
	water: {
		character: '~',
		fg: $rle.color.system.cyan,
		bg: $rle.color.system.blue,
		solid: true,
		interact: function (activator) { return terrain.solid_message(this, activator, 'The water looks too deep to traverse safely.'); }
	},
	bridge: {
		character: '=',
		fg: $rle.color.system.black,
		bg: $rle.color.system.brown,
		interact: function (activator) { return terrain.nonsolid_message(this, activator, 'You tread carefully over the rickety bridge.'); }
	}
}