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

$rle.font = 'bold 10pt sans-serif';

$rle.buffer = [];

$rle.shift = false;

$rle.tiles = true;

/*$rle._tiles = new Image();
$rle._tiles.src = 'terminal16.png';
$rle._tiles.onload = function() {
	// TODO: ???
}*/

$rle.keys = {
	0: 48,
	1: 49,
	2: 50,
	3: 51,
	4: 52,
	5: 53,
	6: 54,
	7: 55,
	8: 56,
	9: 57,
	a: 65,
	b: 66,
	c: 67,
	d: 68,
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
	arrow_e: [39, 76, 102],
	arrow_ne: [85, 105],
	arrow_n: [38, 75, 104],
	arrow_nw: [89, 103],
	arrow_w: [37, 72, 100],
	arrow_sw: [66, 97],
	arrow_s: [40, 74, 98],
	arrow_se: [78, 99],
	escape: 27,
	backspace: 8,
	enter: 13
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
	system: {
		black: {
			r: 0,
			g: 0,
			b: 0
		},
		blue: {
			r: 0,
			g: 0,
			b: 128
		},
		green: {
			r: 0,
			g: 128,
			b: 0
		},
		cyan: {
			r: 0,
			g: 128,
			b: 128
		},
		red: {
			r: 128,
			g: 0,
			b: 0
		},
		magenta: {
			r: 128,
			g: 0,
			b: 128
		},
		brown: {
			r: 128,
			g: 64,
			b: 0
		},
		gray: {
			r: 192,
			g: 192,
			b: 192
		},
		charcoal: {
			r: 128,
			g: 128,
			b: 128
		},
		brightBlue: {
			r: 0,
			g: 0,
			b: 255
		},
		brightGreen: {
			r: 0,
			g: 255,
			b: 0
		},
		brightCyan: {
			r: 0,
			g: 255,
			b: 255
		},
		orange: {
			r: 255,
			g: 128,
			b: 0
		},
		pink: {
			r: 255,
			g: 0,
			b: 255
		},
		yellow: {
			r: 255,
			g: 255,
			b: 0
		},
		white: {
			r: 255,
			g: 255,
			b: 255
		}
	}
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
		if (found) {
			x++;
			continue;
		}
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
		if (options && options.bg) bg = $rle._parse_color(options.bg);
		$rle.ctx.fillStyle = bg;
		$rle.ctx.fillRect(0, 0, $rle.tileW * $rle.screenW, $rle.tileH * $rle.screenH);
		$rle.buffer.length = 0; // apparently this is the preferred way to clear arrays?
		return;
	}
	else {
		console.log('TODO: IMPLEMENT');
	}
}

$rle._put_char = function (chr) {
	if (chr.character == '' || !chr.character) chr.character = '';
	var fg = 'white';
	var bg = 'black';
	if (chr.fg) fg = $rle._parse_color(chr.fg);
	if (chr.bg) bg = $rle._parse_color(chr.bg);
	$rle.ctx.fillStyle = bg;
	$rle.ctx.fillRect(chr.x * $rle.tileW, chr.y * $rle.tileH, $rle.tileW, $rle.tileH);
	$rle.ctx.font = $rle.font;
	$rle.ctx.textBaseline = 'middle';
	$rle.ctx.textAlign = 'center';
	$rle.ctx.fillStyle = fg;
	$rle.ctx.fillText(chr.character, chr.x * $rle.tileW + ($rle.tileW / 2), chr.y * $rle.tileH + ($rle.tileH / 2));
}

$rle._chr = function (number) {
	return String.fromCharCode(number);
}

$rle._ord = function (character) {
	return character.charCodeAt(0);
}

$rle._parse_color = function (color) {
	if (color.r != null && color.g != null && color.b != null) {
		return 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
	}
}

$rle.set_fg = function (x, y, color) {
	console.write('TODO: IMPLEMENT');
}

$rle.set_bg = function (x, y, color) {
	console.write('TODO: IMPLEMENT');
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

$(document).keydown(function (event) {
	if (event.keyCode == 16) $rle.shift = true;
});

$(document).keyup(function (event) {
	if (event.keyCode == 16) $rle.shift = false;
})