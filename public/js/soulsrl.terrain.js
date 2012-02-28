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