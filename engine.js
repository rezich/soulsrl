/******************************************************************************
 *  RLE: RoguelikeEngine, a JavaScript roguelike engine                       *
 *  by Adam "takua108" Rezich                                                 *
 ******************************************************************************/

function $rle() {
}

$rle.can = null;
$rle.ctx = null;

$rle.tileW = 16;
$rle.tileH = 16;
$rle.screenW = 80;
$rle.screenH = 25;

$rle.buffer = [];

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

$rle.setup = function (id) {
	$rle.can = document.getElementById(id);
	$rle.ctx = $rle.can.getContext('2d');
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
	for (var i = 0; i < text.length; i++) {
		var found = false;
		for (var j = 0; j < $rle.buffer.length; j++) {
			if ($rle.buffer[j].x == x && $rle.buffer[j].y == y) {
				$rle.buffer[j].character = text.charAt(i);
				if (options) {
					if (options.fg) $rle.buffer[j].fg = options.fg;
					if (options.bg) $rle.buffer[j].bg = options.bg;
				}
				found = true;
				break;
			}
		}
		if (found) continue;
		else {
			var chr = {
				x: x,
				y: y,
				character: text.charAt(i)
			};
			if (options) {
				if (options.fg) chr.fg = options.fg;
				if (options.bg) chr.bg = options.bg;
			}
			$rle.buffer.push(chr);
		}
		x++;
	}
}

$rle.flush = function() {
	for (var i = 0; i < $rle.buffer.length; i++) {
		var chr = $rle.buffer[i];
		$rle._put_char(chr);
	}
}

$rle.clear = function (x, y, options) {
	if (!x && !y) {
		var bg = 'black';
		if (options && options.bg) bg = options.bg;
		$rle.ctx.fillStyle = bg;
		$rle.ctx.fillRect(0, 0, $rle.tileW * $rle.screenW, $rle.tileH * $rle.screenH);
		$rle.buffer.length = 0;
		return;
	}
	else {
		console.log('warning: not implemented!');
		//this.set_fg(x, y, $rle.color.white);
		//this.set_bg(x, y, $rle.color.black);
		//this.put(x, y, ' ');
	}
}

$rle._put_char = function (chr) {
	if (chr.character == '' || !chr.character) chr.character = '';
	var fg = 'white';
	var bg = 'black';
	if (chr.fg) fg = chr.fg;
	if (chr.bg) bg = chr.bg;
	$rle.ctx.fillStyle = bg;
	$rle.ctx.fillRect(chr.x * $rle.tileW, chr.y * $rle.tileH, $rle.tileW, $rle.tileH);
	$rle.ctx.font = 'bold 10pt sans-serif';
	$rle.ctx.textBaseline = 'middle';
	$rle.ctx.textAlign = 'center';
	$rle.ctx.fillStyle = fg;
	$rle.ctx.fillText(chr.character, chr.x * $rle.tileW + ($rle.tileW / 2 - 1), chr.y * $rle.tileH + ($rle.tileH / 2 - 1));
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

