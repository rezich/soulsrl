////
// terrain - static stuff, walls and floors and so forth
////

function terrain(pos, room, data) {
	this.position = pos;
	this.room = room;

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
		case '$': return terrain.data.illusory_wall;
		case '!': return terrain.data.bonfire;
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

terrain.use_door = function (ent, activator, open, callback) {
	if (callback) callback(ent, activator, open);
	if (open && !ent.open) {
		ent.open = true;
		ent.solid = false;
		ent.character = '\\';
		ent.blocks_light = false;
		if (activator == game.current.player) {
			game.current.messages.write('You open the door.');
		}
		else {
			// TODO: Check player line-of-sight
			game.current.messages.write('Something somehow opened a door.');
		}
		return true;
	}
	else return true;
}

terrain.data = {
	floor: {
		character: '.',
		fg: { r: 80, g: 80, b: 80 },
		bg: { r: 8, g: 8, b: 8 }
	},
	wall: {
		character: '#',
		fg: { r: 16, g: 16, b: 16 },
		bg: { r: 80, g: 80, b: 80 },
		solid: true,
		blocks_light: true,
		interact: function (activator) { return terrain.solid_message(this, activator, 'The wall is sturdy and firm.'); }
	},
	chasm: {
		character: ':',
		fg: { r: 32, g: 32, b: 32 },
		solid: true,
		interact: function (activator) { return terrain.solid_message(this, activator, 'The chasm appears to go on forever. Descending it would be a bad idea.'); }
	},
	door: {
		character: '+',
		fg: { r: 64, g: 64, b: 64 },
		bg: { r: 128, g: 128, b: 128 },
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
		bg: { r: 64, g: 32, b: 0 },
		interact: function (activator) { return terrain.nonsolid_message(this, activator, 'You tread carefully over the rickety bridge.'); }
	},
	secret_door: {
		character: '#',
		fg: { r: 16, g: 16, b: 16 },
		bg: { r: 80, g: 80, b: 80 },
		solid: true,
		blocks_light: true,
		interact: function (activator) {
			return terrain.use_door(this, activator, true, function(ent, activator, open) {
				if (activator == game.current.player && !ent.open) {
					game.current.messages.write('There is a secret door here!');
				}
				ent.fg = terrain.data.door.fg;
				ent.bg = terrain.data.door.bg;
			});
		}
	},
	illusory_wall: {
		character: '#',
		fg: { r: 16, g: 16, b: 16 },
		bg: { r: 80, g: 80, b: 80 },
		solid: true,
		blocks_light: true,
		interact: function (activator) {
			if (!this.solid) return true;
			if (activator == game.current.player) {
				game.current.messages.write('You press against the wall, and discover it to be an illusion!');
			}
			this.solid = false;
			this.blocks_light = false;
			this.fg = terrain.data.floor.fg;
			this.bg = terrain.data.floor.bg;
			this.character = terrain.data.floor.character;
			return false;
		}
	},
	bonfire: {
		character: '!',
		fg: { r: 128, g: 64, b: 0 },
		bg: { r: 8, g: 8, b: 8 },
		solid: true,
		blocks_light: false,
		ignited: false, // have to use 'ignited' since 'lit' is already used
		interact: function (activator) {
			if (activator != game.current.player) return false;
			if (this.ignited) {
				game.current.messages.write('You rest awhile at the bonfire.');
				game.current.player.HP = game.current.player.maxHP;
				game.current.player.estus = game.current.player.max_estus;
				game.current.respawn_room = game.current.current_room;				
				game.current.respawn_position = { x: game.current.player.position.x, y: game.current.player.position.y };
			}
			else {
				game.current.messages.write('You light the bonfire.');
				this.fg = { r: 192, g: 80, b: 0 };
				this.bg = { r: 64, g: 64, b: 0 };
				this.ignited = true;
			}
		}
	}
}