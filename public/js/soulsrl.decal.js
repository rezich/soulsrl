////
// decal - anything that "paints" a tile, so, mostly liquids, so, mostly blood
////

function decal(pos, room, data) {
	this.position = pos;
	this.room = room;

	// TODO: Improve this copy code if decal data is ever going to
	// contain arrays or objects that'll be modified in the copy

	if (data) {
		for (var key in data) {
        	this[key] = data[key];
    	}
	}
}

decal.prototype = new entity();

decal.data = {}