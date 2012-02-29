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
	},


	////
	// GHOST - player ghosts
	////

	ghost: {
		character: '@',
		color: { r: 128, g: 128, b: 128 },
		lit: true,
		solid: false
	}
}