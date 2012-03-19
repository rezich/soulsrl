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
		action: function () { state.add(new state_settings()); }
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
]


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
	this.after_action = null;

	if (options) {
		if (options.scroll_position) {
			if (options.scroll_position == 'bottom') this.scroll_position = Math.max(0, this.text.length - this.height);
			else if (options.scroll_position == 'top') this.scroll_position = 0;
			else this.scroll_position = options.scroll_position;
		}
		if (options.action) this.after_action = options.action;
	}
}

state_reader.prototype = new state();

state_reader.prototype.keys = {
	back: {
		keys: $rle.keys.escape,
		action: function () {
			var act = state.current().after_action;
			state.pop();
			if (act) act();
		}
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
		shift_optional: true,
		action: function () { state.current().type_char('a'); }
	},
	b: {
		keys: $rle.keys.b,
		shift_optional: true,
		action: function () { state.current().type_char('b'); }
	},
	c: {
		keys: $rle.keys.c,
		shift_optional: true,
		action: function () { state.current().type_char('c'); }
	},
	d: {
		keys: $rle.keys.d,
		shift_optional: true,
		action: function () { state.current().type_char('d'); }
	},
	e: {
		keys: $rle.keys.e,
		shift_optional: true,
		action: function () { state.current().type_char('e'); }
	},
	f: {
		keys: $rle.keys.f,
		shift_optional: true,
		action: function () { state.current().type_char('f'); }
	},
	g: {
		keys: $rle.keys.g,
		shift_optional: true,
		action: function () { state.current().type_char('g'); }
	},
	h: {
		keys: $rle.keys.h,
		shift_optional: true,
		action: function () { state.current().type_char('h'); }
	},
	i: {
		keys: $rle.keys.i,
		shift_optional: true,
		action: function () { state.current().type_char('i'); }
	},
	j: {
		keys: $rle.keys.j,
		shift_optional: true,
		action: function () { state.current().type_char('j'); }
	},
	k: {
		keys: $rle.keys.k,
		shift_optional: true,
		action: function () { state.current().type_char('k'); }
	},
	l: {
		keys: $rle.keys.l,
		shift_optional: true,
		action: function () { state.current().type_char('l'); }
	},
	m: {
		keys: $rle.keys.m,
		shift_optional: true,
		action: function () { state.current().type_char('m'); }
	},
	n: {
		keys: $rle.keys.n,
		shift_optional: true,
		action: function () { state.current().type_char('n'); }
	},
	o: {
		keys: $rle.keys.o,
		shift_optional: true,
		action: function () { state.current().type_char('o'); }
	},
	p: {
		keys: $rle.keys.p,
		shift_optional: true,
		action: function () { state.current().type_char('p'); }
	},
	q: {
		keys: $rle.keys.q,
		shift_optional: true,
		action: function () { state.current().type_char('q'); }
	},
	r: {
		keys: $rle.keys.r,
		shift_optional: true,
		action: function () { state.current().type_char('r'); }
	},
	s: {
		keys: $rle.keys.s,
		shift_optional: true,
		action: function () { state.current().type_char('s'); }
	},
	t: {
		keys: $rle.keys.t,
		shift_optional: true,
		action: function () { state.current().type_char('t'); }
	},
	u: {
		keys: $rle.keys.u,
		shift_optional: true,
		action: function () { state.current().type_char('u'); }
	},
	v: {
		keys: $rle.keys.v,
		shift_optional: true,
		action: function () { state.current().type_char('v'); }
	},
	w: {
		keys: $rle.keys.w,
		shift_optional: true,
		action: function () { state.current().type_char('w'); }
	},
	x: {
		keys: $rle.keys.x,
		shift_optional: true,
		action: function () { state.current().type_char('x'); }
	},
	y: {
		keys: $rle.keys.y,
		shift_optional: true,
		action: function () { state.current().type_char('y'); }
	},
	z: {
		keys: $rle.keys.z,
		shift_optional: true,
		action: function () { state.current().type_char('z'); }
	},
	confirm: {
		keys: $rle.keys.enter,
		action: function () { state.current().confirm(); }
	},
	backspace: {
		keys: $rle.keys.backspace,
		action: function () { state.current().delete_char(); }
	},
	cancel: {
		keys: $rle.keys.escape,
		action: function () { state.replace(new state_mainMenu()); }
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
	if (this.name.length >= 8) {
		$rle.put(40, 15, '8 letter maximum.', { align: 'center', fg: $rle.color.system.red });
		$rle.flush();
	}
	else {
		this.name = this.name + ($rle.shift ? chr.toUpperCase() : chr);
		this.draw();
	}
}

state_inputName.prototype.delete_char = function () {
	if (this.name == '') return;
	this.name = this.name.substring(0, this.name.length - 1);
	this.draw();
}

state_inputName.prototype.confirm = function () {
	if (this.name) game.current.preload({ player_name: this.name });
	else {
		$rle.put(40, 15, 'Please enter a name.', { align: 'center', fg: $rle.color.system.red });
		$rle.flush();
	}
}


////
// state_settings - settings screen
////

function state_settings() {
	this.cursor = 0;

}

state_settings.prototype = new state();

state_settings.prototype.keys = {
	up: {
		keys: $rle.keys.arrow_n,
		action: function () { state.current().move_cursor_vertically(-1); /* TODO: Find a better way to do this? */ }
	},
	down: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().move_cursor_vertically(1); /* TODO: Find a better way to do this? */ }
	},
	left: {
		keys: $rle.keys.arrow_w,
		action: function () { state.current().move_cursor_horizontally(-1); /* TODO: Find a better way to do this? */ }
	},
	right: {
		keys: $rle.keys.arrow_e,
		action: function () { state.current().move_cursor_horizontally(1); /* TODO: Find a better way to do this? */ }
	},
	confirm: {
		keys: $rle.keys.enter,
		action: function () {  }
	},
	cancel: {
		keys: $rle.keys.escape,
		action: function () { state.pop(); }
	},
	lololol: {
		keys: {
			key: 20,
			shift: true
		},
		action: function () {
			$rle.font.face = '"Comic Sans MS"';
			state.current().draw();
		}
	}
}

state_settings.prototype.draw = function () {
	$rle.clear();
	$rle.put(40, 1, 'Settings', { align: 'center', fg: $rle.color.system.cyan });

	for (var i = 0; i < state_settings.settings.length; i++) {
		var sfg = $rle.blend((this.cursor == i ? $rle.color.system.white : $rle.color.system.gray), $rle.color.system.black, (state_settings.settings[i].disabled ? 0.75 : 0));
		$rle.put(39, 3 + i, state_settings.settings[i].text, { align: 'right', fg: sfg });
		var optlength = 0;
		for (var j = 0; j < state_settings.settings[i].options.length; j++) {
			var ofg = $rle.blend((this.cursor == i ?
				(game.current.settings[state_settings.settings[i].variable] == state_settings.settings[i].options[j].value ?
					$rle.color.system.white :
					$rle.color.system.white
				) :
				$rle.color.system.gray
			), $rle.color.system.black, (state_settings.settings[i].disabled || state_settings.settings[i].options[j].disabled ? 0.75 : 0));
			var obg = $rle.blend((game.current.settings[state_settings.settings[i].variable] == state_settings.settings[i].options[j].value ?
				(this.cursor == i ?
					$rle.blend($rle.color.system.cyan, $rle.color.system.black, 0.25) :
					$rle.color.system.charcoal
				) :
				$rle.color.system.black
			), $rle.color.system.black, (state_settings.settings[i].disabled || state_settings.settings[i].options[j].disabled ? 0.75 : 0));

			$rle.put(41 + optlength, 3 + i, state_settings.settings[i].options[j].text, { fg: ofg, bg: obg });
			optlength += state_settings.settings[i].options[j].text.length + 1;
		}
	}

	if (state_settings.settings[this.cursor].description) $rle.put(40, 21, state_settings.settings[this.cursor].description, { align: 'center', fg: $rle.color.system.gray });

	$rle.put(40, 23, 'arrows, numpad, vi keys: choose, adjust settings', { align: 'center', fg: $rle.color.system.charcoal });
	$rle.put(40, 24, 'escape: return', { align: 'center', fg: $rle.color.system.charcoal });	
	$rle.flush();
}

state_settings.prototype.move_cursor_vertically = function (amount) {
	do {
		this.cursor += amount;
		if (this.cursor < 0) this.cursor += state_settings.settings.length;
		if (this.cursor > state_settings.settings.length - 1) this.cursor -= state_settings.settings.length;
		this.draw();
	} while (state_settings.settings[this.cursor].disabled);
}

state_settings.prototype.move_cursor_horizontally = function (amount) {
	var current_option = null;
	for (var i = 0; i < state_settings.settings[this.cursor].options.length; i++) {
		if (game.current.settings[state_settings.settings[this.cursor].variable] == state_settings.settings[this.cursor].options[i].value) {
			current_option = i;
			break;
		}
	}
	do {
		current_option += amount;
		if (current_option < 0) current_option += state_settings.settings[this.cursor].options.length;
		if (current_option > state_settings.settings[this.cursor].options.length - 1) current_option -= state_settings.settings[this.cursor].options.length;
	} while (state_settings.settings[this.cursor].options[current_option].disabled)
	game.current.settings[state_settings.settings[this.cursor].variable] = state_settings.settings[this.cursor].options[current_option].value;
	if (state_settings.settings[this.cursor].options[current_option].action) state_settings.settings[this.cursor].options[current_option].action();
	this.draw();
}

state_settings.settings = [
	{
		text: 'Noob Mode',
		description: 'Prevents the player from making certain stupid decisions',
		variable: 'noob_mode',
		options: [
			{
				text: 'Enabled',
				value: true
			},
			{
				text: 'Disabled',
				value: false
			}
		]
	},
	{
		text: 'Font Face',
		description: "Change the font used to render the game",
		variable: 'font_face',
		options: [
			{
				text: 'Serif',
				value: 'serif',
				action: function () {
					$rle.font.face = 'serif';
				}
			},
			{
				text: 'Sans-Serif',
				value: 'sans-serif',
				action: function () {
					$rle.font.face = 'sans-serif';
				}
			},
			{
				text: 'Monospace',
				value: 'monospace',
				action: function () {
					$rle.font.face = 'monospace';
				}
			}
		]
	},
	{
		text: 'Font Weight',
		description: 'Set whether or not the font should be bold',
		variable: 'font_weight',
		options: [
			{
				text: 'Normal',
				value: 'normal',
				action: function () {
					$rle.font.weight = 'normal';
				}
			},
			{
				text: 'Bold',
				value: 'bold',
				action: function () {
					$rle.font.weight = 'bold';
				}
			}
		]
	},
	{
		text: 'Font Size',
		description: 'Fine-tune the font size relative to the tile size',
		variable: 'font_size',
		options: [
			{
				text: '-4',
				value: -4,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '-3',
				value: -3,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '-2',
				value: -2,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '-1',
				value: -1,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '0',
				value: 0,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '+1',
				value: 1,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '+2',
				value: 2,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '+3',
				value: 3,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			},
			{
				text: '+4',
				value: 4,
				action: function () {
					$rle.font.size = ($rle.tileW + game.current.settings.font_size).toString() + 'px';
				}
			}
		]
	},
	{
		text: 'Tile Size',
		description: 'Adjust the size of the tiles',
		variable: 'tile_size',
		disabled: true,
		options: [
			{
				text: '8x8',
				value: 8
			},
			{
				text: '12x12',
				value: 12
			},
			{
				text: '16x16',
				value: 16
			},
			{
				text: '24x24',
				value: 24
			}
		]
	},
]


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
// state_more - wait for a keypress to display more messages, etc.
////

function state_more(action) {
	this.more_action = action;
	this.queued_actions = [];
}

state_more.prototype = new state();

state_more.prototype.keys = {
	more: {
		keys: [$rle.keys.space, $rle.keys.enter],
		action: function () {
			if (state.current().more_action) game.current.queued_actions.push(state.current().more_action);
			state.pop();
			if (game.current.queued_actions.length > 0) {
				if (game.current.messages.lastLine >= game.current.messages.lines.length - 1) {
					for (var i = 0; i < game.current.queued_actions.length; i++) {
						game.current.queued_actions[i]();
					}
					game.current.queued_actions.length = 0;
				}
			}
			else {
				state.current().draw();
			}
		}
	}
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
		action: function () { state.current().move_player($rle.dir.n); game.current.update(); }
	},
	east: {
		keys: $rle.keys.arrow_e,
		action: function () { state.current().move_player($rle.dir.e); game.current.update(); }
	},
	west: {
		keys: $rle.keys.arrow_w,
		action: function () { state.current().move_player($rle.dir.w); game.current.update(); }
	},
	south: {
		keys: $rle.keys.arrow_s,
		action: function () { state.current().move_player($rle.dir.s); game.current.update(); }
	},
	northwest: {
		keys: $rle.keys.arrow_nw,
		action: function () { state.current().move_player($rle.dir.nw); game.current.update(); }
	},
	northeast: {
		keys: $rle.keys.arrow_ne,
		action: function () { state.current().move_player($rle.dir.ne); game.current.update(); }
	},
	southwest: {
		keys: $rle.keys.arrow_sw,
		action: function () { state.current().move_player($rle.dir.sw); game.current.update(); }
	},
	southeast: {
		keys: $rle.keys.arrow_se,
		action: function () { state.current().move_player($rle.dir.se); game.current.update(); }
	},
	wait: {
		keys: [$rle.keys.z, 101],
		action: function () { game.current.update(); }
	},
	quaff_estus: {
		keys: $rle.keys.q,
		action: function () {
			if (!game.current.player.has_estus) return;
			if (game.current.player.estus > 0) {
				if (game.current.settings.noob_mode && game.current.player.HP == game.current.player.maxHP) {
					game.current.messages.write("Drinking from your Estus Flask would be pointless; you're already fully healthy!");
					state.current().draw();
				}
				else {
					game.current.player.estus--;
					var amount = Math.min(game.current.player.estus_amount, game.current.player.maxHP - game.current.player.HP);
					game.current.player.HP += game.current.player.estus_amount;
					game.current.messages.write("You take a swig of your Estus Flask" + (amount ? ", and recover " + amount.toString() + " HP!" : "."));
					game.current.update();
				}
			}
			else {
				if (game.current.settings.noob_mode) {
					game.current.messages.write("Your Estus Flask is empty!");
					state.current().draw();
				}
				else {
					game.current.messages.write("You take a swig of your Estus Flask... but it's empty!");
					game.current.update();
				}
			}
		}
	},
	show_logs: {
		keys: {
			key: $rle.keys.m,
			shift: true
		},
		action: function () {
			state.add(new state_reader(game.current.messages.logs, { scroll_position: 'bottom' }), { clear: false });
		}
	},
	quit: {
		keys: {
			key: $rle.keys.q,
			shift: true
		},
		action: function () {
			state.add(new state_confirm('Really quit', function () {
				game.reset();
			}));
		}
	}
}

state_game.prototype.draw = function () {
	$rle.clear();
	this.draw_partial();
	game.current.drawUI();
	game.current.messages.draw();
	$rle.flush();
}

state_game.prototype.update = function () {
	game.current.player_move_history.shift();
	game.current.player_move_history.push({ x: game.current.player.position.x, y: game.current.player.position.y, room: game.current.current_room });
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

state_game.prototype.kill_player = function () {
	game.current.messages.write('Y O U  D I E D.');
	// TODO: Bloodstain
	for (var r in game.current.rooms) {
		console.log(r);
		for (var i = 0; i < game.current.rooms[r].items.length; i++) {
			console.log(game.current.rooms[r].items[i]);
			if (game.current.rooms[r].items[i].bloodstain) game.current.rooms[r].items.splice(i, 1);
		}
	}
	var bloodstain = game.current.player_move_history[0].room.add_item({ x: game.current.player_move_history[0].x, y: game.current.player_move_history[0].y }, item.data.player_bloodstain);
	bloodstain.souls = game.current.player.souls;
	bloodstain.humanity = game.current.player.humanity;
	game.current.player.souls = 0;
	game.current.player.humanity = 0;
	if (game.current.messages.lines.length - game.current.messages.lastLine > 4) {
		game.current.queued_actions.push(function () { // BWOOOOOOOOOOM
			state.add(new state_more(function () { // BWOOOOOOOOOOM
				state.current().respawn_player(); // BWOOOOOOOOOOM
			}));
		});
	}
	else {
		state.current().draw();
		state.add(new state_more(function () { // BWOOOOOOOOOOM
			state.current().respawn_player(); // BWOOOOOOOOOOM
		}));
	}
}

state_game.prototype.respawn_player = function () {
	game.current.player.HP = game.current.player.maxHP;
	game.current.current_room = game.current.respawn_room;
	game.current.player.room = game.current.current_room;
	game.current.respawn_room.creatures.push(game.current.player);
	game.current.player.position.x = game.current.respawn_position.x;
	game.current.player.position.y = game.current.respawn_position.y;
	for (var i = 0; i < game._bloodstainPast; i++) game.current.player_move_history.push({ x: game.current.player.position.x, y: game.current.player.position.y, room: game.current.current_room });
	this.draw();
}