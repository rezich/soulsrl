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
		return this.terrain.concat(this.creatures).concat(_PLAYERS);
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