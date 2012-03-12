////
// item - things that you can see in the world, but then pick up and keep in inventory
////

function item(pos, room, data) {
	this.position = pos;
	this.room = room;

	this.pickupable = true;

	// TODO: Improve this copy code if item data is ever going to
	// contain arrays or objects that'll be modified in the copy

	if (data) {
		for (var key in data) {
			this[key] = data[key];
    	}
	}
}

item.prototype = new entity();

item.data = {}