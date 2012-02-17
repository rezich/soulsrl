/******************************************************************************
 *  RLE: RoguelikeEngine, a JavaScript roguelike engine                       *
 *  by Adam "takua108" Rezich                                                 *
 ******************************************************************************/

function $rle() {
}

$rle.tiles = false;

$rle.keys = {
	arrow_e: [39, 76, 102],
	arrow_ne: [85, 105],
	arrow_n: [38, 75, 104],
	arrow_nw: [89, 103],
	arrow_w: [37, 72, 100],
	arrow_sw: [66, 97],
	arrow_s: [40, 74, 98],
	arrow_se: [78, 99],
	escape: [27]
}

$rle.dir = {
	e: 0,
	ne: 1,
	n: 2,
	nw: 3,
	w: 4,
	sw: 5,
	s: 6,
	sw: 7
}

$rle.color = {
	black: 'rgb(0, 0, 0)',
	blue: 'rgb(0, 0, 128)',
	green: 'rgb(0, 128, 0)',
	cyan: 'rgb(0, 128, 128)',
	red: 'rgb(128, 0, 0)',
	magenta: 'rgb(128, 0, 128)',
	brown: 'rgb(128, 64, 0)',
	gray: 'rgb(192, 192, 192)',
	charcoal: 'rgb(128, 128, 128)',
	brightBlue: 'rgb(0, 0, 255)',
	brightGreen: 'rgb(0, 255, 0)',
	brightCyan: 'rgb(0, 255, 255)',
	orange: 'rgb(255, 128, 0)',
	pink: 'rgb(255, 0, 255)',
	yellow: 'rgb(255, 255, 0)',
	white: 'rgb(255, 255, 255)'
}

$rle.box = {
	ns: '|',
	ws: '+',
	ne: '+',
	ew: '-',
	nw: '+',
	es: '+'
}

$rle.setup = function () {
	
	for (var i = 0; i < 25; i++) {
		$('#screen').append('<div></div>');
	}
	for (var i = 0; i < 25; i++) {
		for (var j = 0; j < 80; j++) {
			$($('#screen').children('div')[i]).append('<div></div>');
		}
	}
}

$rle.put = function(x, y, text, options) {
	if (!text) return;
	if (options) {
		if (options.align) {
			if (options.align == 'center') {
				x -= Math.ceil(text.length / 2);
			}
			if (options.align == 'right') {
				x -= text.length;
			}
		}
	}
	while (text != '') {
		this._put_char(x, y, text.charAt(0));
		if (options) {
			if (options.fg) this.set_fg(x, y, options.fg);
			if (options.bg) this.set_bg(x, y, options.bg);
		}
		text = text.substring(1);
		x++;
	}
}

$rle.clear = function (x, y, options) {
	if (!x && !y) {
		$('#screen>div>div>div').html('&nbsp;');
		$('#screen>div>div').css('color', 'white');
		$('#screen>div>div').css('background', 'black');
		return;
	}
	this.set_fg(x, y, $rle.color.white);
	this.set_bg(x, y, $rle.color.black);
	this.put(x, y, ' ');
}

$rle._put_char = function (x, y, chr) {
	chr = $rle._convert_to_html(chr);
	if (chr == '' || chr == null) {
		if (this.tiles) return;
		chr = ' ';
	}
	var line = $($('#screen').children('div')[y]);
	var character = $(line.children('div')[x]);
	character.html('');
	if (this.tiles) {
		var x = Math.floor(this._ord(chr) / 16) * 16
		var y = (this._ord(chr) % 16) * 16;
		character.css('backgroundPosition', -x + 'px ' + -y + 'px');
	}
	else {
		if (chr == ' ') {
			chr = '&nbsp;';
		}
		character.html('<div>' + chr + '</div>');
	}
}

$rle._element_at = function (x, y) {
	return $($($('#screen').children('div')[y]).children('div')[x]);
}

$rle._chr = function (number) {
	return String.fromCharCode(number);
}

$rle._ord = function (character) {
	return character.charCodeAt(0);
}

$rle._convert_to_html = function (character) {
	return character.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

$rle.set_fg = function (x, y, color) {
	if (this.tiles) {
	}
	else {
		this._element_at(x, y).css('color', color);
	}
}

$rle.set_bg = function (x, y, color) {
	if (this.tiles) {
	}
	else {
		this._element_at(x, y).css('background', color);
	}
}

$rle.draw_box = function (x, y, w, h) {
	this.put(x, y, this.box.es);
	this.put(x + w, y, this.box.ws);
	this.put(x, y + h, this.box.ne);
	this.put(x + w, y + h, this.box.nw);
	for (var i = 0; i < w - 1; i++) {
		this.put(x + 1 + i, y, this.box.ew);
		this.put(x + 1 + i, y + h, this.box.ew);
	}
	for (var i = 0; i < h - 1; i++) {
		this.put(x, y + 1 + i, this.box.ns);
		this.put(x + w, y + 1 + i, this.box.ns);
	}
}

