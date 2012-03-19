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

item.prototype.interact_with = function (activator) {
	// return false to override movement
	if (this.interact) {
		return this.interact(activator);
	}
	else {
		return true;
	}
}

item.prototype.remove_from_room = function () {
	for (var i in this.room.items) {
		if (this.room.items[i] == this) {
			this.room.items.splice(i, 1);
			break;
		}
	}
}

item.data = {
	player_bloodstain: {
		character: '%',
		fg: { r: 255, g: 0, b: 0 },
		bg: { r: 128, g: 0, b: 0 },
		interact: function (activator) {
			if (activator != game.current.player) return;
			activator.souls += this.souls;
			activator.humanity += this.humanity;
			game.current.messages.write("You recover " + (this.souls ? this.souls.toString() + " souls " : "") + (this.souls && this.humanity ? "and " : "") + (this.humanity ? this.humanity.toString() + " humanity " : "") + (this.souls || this.humanity ? "from " : "") + "your bloodstain.");
			this.remove_from_room();
		},
		souls: 0,
		humanity: 0
	}
}