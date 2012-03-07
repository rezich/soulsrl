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
	state.current().draw();
}

state.replace = function(s, options) {
	state.list.pop();
	state.add(s, options);
}

state.reset = function () {
	state.list = [];
}

state.pop = function (options) {
	state.list.pop();
	$rle.clear();
	if (options) {
		if (options.noredraw) return;
	}
	state.current().draw();
}

state.prototype.keys = { }

state.prototype.draw = function () { }

state.prototype.update = function () { }

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
		action: function () {
			state.add(new state_loading(), { clear: true });
			$.ajax({
				url: 'manual.txt',
				dataType: 'text',
				cache: false,
				success: function (data) {
					state.pop();
					state.add(new state_reader(data), { clear: true });
				}
			});
		}
	}
];


////
// state_loading - just a fat loading screen
////

function state_loading(options) {
	if (options) {
		if (options.action) options.action();
	}
}

state_loading.prototype = new state();

state_loading.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 13, 'L O A D I N G . . .', { align: 'center' });
	$rle.flush();
}


////
// state_reader - text reader, for the manual and message log
////

function state_reader(data, options) {
	this.text = data.split('\n');
	this.scroll_position = 0;
	this.height = 22;

	if (options) {
		if (options.scroll_position) {
			if (options.scroll_position == 'bottom') this.scroll_position = Math.max(0, this.text.length - this.height);
			else if (options.scroll_position == 'top') this.scroll_position = 0;
			else this.scroll_position = options.scroll_position;
		}
	}
}

state_reader.prototype = new state();

state_reader.prototype.keys = {
	back: {
		keys: $rle.keys.escape,
		action: function () { state.pop(); }
	},
	page_up: {
		keys: $rle.keys.page_up,
		action: function () { state.current().scroll_position = Math.max(state.current().scroll_position - state.current().height, 0); state.current().draw(); }
	},
	page_down: {
		keys: $rle.keys.page_down,
		action: function () { state.current().scroll_position = Math.min(state.current().scroll_position + state.current().height, state.current().text.length - state.current().height); state.current().draw(); }
	},
	up: {
		keys: $rle.keys.arrow_n,
		action: function () { state.current().scroll_position = Math.max(state.current().scroll_position - 1, 0); state.current().draw(); }
	},
	down: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().scroll_position = Math.min(state.current().scroll_position + 1, state.current().text.length - state.current().height); state.current().draw(); }
	}
}

state_reader.prototype.draw = function () {
	$rle.clear();
	if (this.text) {
		for (var i = 0; i < this.height; i++) {
			if (this.scroll_position + i > this.text.length) break;
			$rle.put(0, i, this.text[this.scroll_position + i]);
		}
	}

	$rle.put(40, 22, "arrows, numpad, vi keys, page up/down: scroll", { align: 'center', fg: $rle.color.system.charcoal });
	$rle.put(40, 23, 'home/end: scroll to top/bottom', { align: 'center', fg: $rle.color.system.charcoal });
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
// state_confirm - confirm something before it happens
////

function state_confirm(message, action) {
	this.message = message;
	this.confirm_action = action;
	this.draw();
}

state_confirm.prototype = new state();

state_confirm.prototype.keys = {
	y: {
		keys: {
			key: $rle.keys.y,
			shift: true
		},
		action: function () {
			var act = state.current().confirm_action;
			state.pop();
			act();
		}
	},
	n: {
		keys: $rle.keys.n,
		action: function () {
			state.pop();
			state.current().draw();
		}
	}
}

state_confirm.prototype.draw = function () {
	$rle.put(0, 0, '                                                                                ');
	$rle.put(0, 1, '                                                                                ');
	$rle.put(0, 2, '                                                                                ');
	$rle.put(0, 1, this.message + ' (Y/n)?');
	$rle.flush();
}


////
// state_game - main game state
////

function state_game(player_name) {
	game.current.init(player_name);
	this.in_game = true;
}

state_game.prototype = new state();

state_game.prototype.keys = {
	north: {
		keys: $rle.keys.arrow_n,
		action: function () { state.current().move_player($rle.dir.n); return true; }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () { state.current().move_player($rle.dir.e); return true; }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () { state.current().move_player($rle.dir.w); return true; }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().move_player($rle.dir.s); return true; }
	},
	northwest: {
		keys: $rle.keys.arrow_nw,
		action: function () { state.current().move_player($rle.dir.nw); return true; }
	},
	northeast: {
		keys: $rle.keys.arrow_ne,
		action: function () { state.current().move_player($rle.dir.ne); return true; }
	},
	southwest: {
		keys: $rle.keys.arrow_sw,
		action: function () { state.current().move_player($rle.dir.sw); return true; }
	},
	southeast: {
		keys: $rle.keys.arrow_se,
		action: function () { state.current().move_player($rle.dir.se); return true; }
	},
	wait: {
		keys: [90, 101],
		action: function () { state.current().draw(); return true; }
	},
	show_logs: {
		keys: {
			key: $rle.keys.m,
			shift: true
		},
		action: function () {
			var msg = '';
			var q = '';
			var m = 1;
			for (var i in game.current.messages.lines) {
				if (game.current.messages.lines[i].text == q) {
					m++;
				}
				else {
					msg += '\n' + q + (m > 1 ? ' (x' + m + ')' : '');
					q = game.current.messages.lines[i].text;
					m = 1;
				}
			}
			msg += '\n' + q + (m > 1 ? ' (x' + m + ')' : '');
			msg = msg.substring(2);
			state.add(new state_reader(msg, { scroll_position: 'bottom' }), { clear: false });
			return false;
		}
	},
	quit: {
		keys: {
			key: $rle.keys.q,
			shift: true
		},
		action: function () {
			state.add(new state_confirm('Really quit', function () {
				$rle.clear();
				delete game.current;
				new game();
			}));
		}
	}
}

state_game.prototype.draw = function () {
	$rle.clear();
	this.draw_partial();
	game.current.messages.draw();
	game.current.drawUI();
	$rle.flush();
}

state_game.prototype.update = function () {
	for (var c in game.current.current_room.creatures) {
		if (game.current.current_room.creatures[c] == game.current.player) continue;
		game.current.current_room.creatures[c].update();
	}
	state.current().draw(true);
	if (_MULTIPLAYER) now.updatePlayer(game.current.player.position.x, game.current.player.position.y, game.current.current_room.name);
}

state_game.prototype.draw_partial = function () {
	// HACKY, kind of
	for (var i = 0; i < 20; i++) {
		$rle.put(0, 3 + i, '                                                                                ');
	}
	var ents = game.current.current_room.entities;
	for (var i in ents) {
		ents[i].lit = false;
	}
	fieldOfView(game.current.player.position.x, game.current.player.position.y, game.current.current_room.visibility, game.visit, game.blocked);
	for (var i in ents) {
		ents[i].draw();
	}
	game.current.player.draw();
}

state_game.prototype.move_player = function (direction) {
	game.current.player.move(direction);
}