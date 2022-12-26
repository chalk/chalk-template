import test from 'ava';
import {template as templateStdout, templateStderr} from '../index.js';

for (const [template, stdio] of [[templateStdout, 'stdout'], [templateStderr, 'stderr']]) {
	test(`[${stdio}] correctly parse and evaluate color-convert functions`, t => {
		t.is(template('{bold.rgb(144,10,178).inverse Hello, {~inverse there!}}'),
			'\u001B[1m\u001B[38;2;144;10;178m\u001B[7mHello, '
			+ '\u001B[27m\u001B[39m\u001B[22m\u001B[1m'
			+ '\u001B[38;2;144;10;178mthere!\u001B[39m\u001B[22m');

		t.is(template('{bold.bgRgb(144,10,178).inverse Hello, {~inverse there!}}'),
			'\u001B[1m\u001B[48;2;144;10;178m\u001B[7mHello, '
			+ '\u001B[27m\u001B[49m\u001B[22m\u001B[1m'
			+ '\u001B[48;2;144;10;178mthere!\u001B[49m\u001B[22m');
	});

	test(`[${stdio}] properly handle escapes`, t => {
		t.is(template('{bold hello \\{in brackets\\}}'),
			'\u001B[1mhello {in brackets}\u001B[22m');
	});

	test(`[${stdio}] throw if there is an unclosed block`, t => {
		t.throws(() => {
			template('{bold this shouldn\'t work ever\\}');
		}, {
			message: 'Chalk template literal is missing 1 closing bracket (`}`)',
		});

		t.throws(() => {
			template('{bold this shouldn\'t {inverse appear {underline ever\\} :) \\}');
		}, {
			message: 'Chalk template literal is missing 3 closing brackets (`}`)',
		});
	});

	test(`[${stdio}] throw if there is an invalid style`, t => {
		t.throws(() => {
			template('{abadstylethatdoesntexist this shouldn\'t work ever}');
		}, {
			message: 'Unknown Chalk style: abadstylethatdoesntexist',
		});
	});

	test(`[${stdio}] properly style multiline color blocks`, t => {
		t.is(
			template(`{bold
				Hello! This is a
				${'multiline'} block!
				:)
			} {underline
				I hope you enjoy
			}`),
			'\u001B[1m\u001B[22m\n'
			+ '\u001B[1m\t\t\t\tHello! This is a\u001B[22m\n'
			+ '\u001B[1m\t\t\t\tmultiline block!\u001B[22m\n'
			+ '\u001B[1m\t\t\t\t:)\u001B[22m\n'
			+ '\u001B[1m\t\t\t\u001B[22m \u001B[4m\u001B[24m\n'
			+ '\u001B[4m\t\t\t\tI hope you enjoy\u001B[24m\n'
			+ '\u001B[4m\t\t\t\u001B[24m',
		);
	});

	test(`[${stdio}] should allow bracketed Unicode escapes`, t => {
		t.is(template('\u{AB}'), '\u{AB}');
		t.is(template('This is a {bold \u{AB681}} test'), 'This is a \u001B[1m\u{AB681}\u001B[22m test');
		t.is(template('This is a {bold \u{10FFFF}} test'), 'This is a \u001B[1m\u{10FFFF}\u001B[22m test');
	});

	test(`[${stdio}] should handle special hex case`, t => {
		t.is(template('{#FF0000 hello}'), '\u001B[38;2;255;0;0mhello\u001B[39m');
		t.is(template('{#:FF0000 hello}'), '\u001B[48;2;255;0;0mhello\u001B[49m');
		t.is(template('{#00FF00:FF0000 hello}'), '\u001B[38;2;0;255;0m\u001B[48;2;255;0;0mhello\u001B[49m\u001B[39m');
		t.is(template('{bold.#FF0000 hello}'), '\u001B[1m\u001B[38;2;255;0;0mhello\u001B[39m\u001B[22m');
		t.is(template('{bold.#:FF0000 hello}'), '\u001B[1m\u001B[48;2;255;0;0mhello\u001B[49m\u001B[22m');
		t.is(template('{bold.#00FF00:FF0000 hello}'), '\u001B[1m\u001B[38;2;0;255;0m\u001B[48;2;255;0;0mhello\u001B[49m\u001B[39m\u001B[22m');
		t.is(template('{#FF0000.bold hello}'), '\u001B[38;2;255;0;0m\u001B[1mhello\u001B[22m\u001B[39m');
		t.is(template('{#:FF0000.bold hello}'), '\u001B[48;2;255;0;0m\u001B[1mhello\u001B[22m\u001B[49m');
		t.is(template('{#00FF00:FF0000.bold hello}'), '\u001B[38;2;0;255;0m\u001B[48;2;255;0;0m\u001B[1mhello\u001B[22m\u001B[49m\u001B[39m');
	});
}
