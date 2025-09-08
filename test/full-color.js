import test from 'ava';
import {chalkTemplate} from '../dist/index.js';

test('correctly parse and evaluate color-convert functions', t => {
	t.is(chalkTemplate`{bold.rgb(144,10,178).inverse Hello, {~inverse there!}}`,
		'\u001B[1m\u001B[38;2;144;10;178m\u001B[7mHello, '
		+ '\u001B[27m\u001B[39m\u001B[22m\u001B[1m'
		+ '\u001B[38;2;144;10;178mthere!\u001B[39m\u001B[22m');

	t.is(chalkTemplate`{bold.bgRgb(144,10,178).inverse Hello, {~inverse there!}}`,
		'\u001B[1m\u001B[48;2;144;10;178m\u001B[7mHello, '
		+ '\u001B[27m\u001B[49m\u001B[22m\u001B[1m'
		+ '\u001B[48;2;144;10;178mthere!\u001B[49m\u001B[22m');
});

test('no need to escapes', t => {
	t.is(chalkTemplate`{bold hello \{in brackets\}}`,
		'\x1B[1mhello \x1B[22m\x1B[1m{\x1B[22m\x1B[1min brackets\x1B[22m}');
});

test('do not throw if there is an unclosed block', t => {
	t.is(chalkTemplate`{bold this should work\}`,'\x1B[1mthis should work\x1B[22m')
	t.is(chalkTemplate`{bold bold does not work {inverse inverse works {underline underline works\} :) \}`,'{bold bold does not work \x1B[7minverse works \x1B[27m\x1B[7m\x1B[4munderline works\x1B[24m\x1B[27m\x1B[7m :) \x1B[27m');
});

test('do not throw if there is an invalid style', t => {
	t.is(
		chalkTemplate`{abadstylethatdoesntexist this should work as unprocessed}`,
		`{abadstylethatdoesntexist this should work as unprocessed}`);
});

test('properly style multiline color blocks', t => {
	t.is(
		chalkTemplate`{bold
			Hello! This is a
			${'multiline'} block!
			:)
		} {underline
			I hope you enjoy
		}`,
		'\u001B[1m\u001B[22m\n'
		+ '\u001B[1m\t\t\tHello! This is a\u001B[22m\n'
		+ '\u001B[1m\t\t\tmultiline block!\u001B[22m\n'
		+ '\u001B[1m\t\t\t:)\u001B[22m\n'
		+ '\u001B[1m\t\t\u001B[22m \u001B[4m\u001B[24m\n'
		+ '\u001B[4m\t\t\tI hope you enjoy\u001B[24m\n'
		+ '\u001B[4m\t\t\u001B[24m',
	);
});

test('handle escape interpolated values', t => {
	t.is(chalkTemplate`Hello {bold hi}`, 'Hello \u001B[1mhi\u001B[22m');
	t.is(chalkTemplate`Hello ${'{bold hi}'}`, 'Hello \u001B[1mhi\u001B[22m');
});

test('should allow bracketed Unicode escapes', t => {
	t.is(chalkTemplate`\u{AB}`, '\u{AB}');
	t.is(chalkTemplate`This is a {bold \u{AB681}} test`, 'This is a \u001B[1m\u{AB681}\u001B[22m test');
	t.is(chalkTemplate`This is a {bold \u{10FFFF}} test`, 'This is a \u001B[1m\u{10FFFF}\u001B[22m test');
});

test('should handle special hex case', t => {
	t.is(chalkTemplate`{#FF0000 hello}`, '\u001B[38;2;255;0;0mhello\u001B[39m');
	t.is(chalkTemplate`{#:FF0000 hello}`, '\u001B[48;2;255;0;0mhello\u001B[49m');
	t.is(chalkTemplate`{#00FF00:FF0000 hello}`, '\u001B[38;2;0;255;0m\u001B[48;2;255;0;0mhello\u001B[49m\u001B[39m');
	t.is(chalkTemplate`{bold.#FF0000 hello}`, '\u001B[1m\u001B[38;2;255;0;0mhello\u001B[39m\u001B[22m');
	t.is(chalkTemplate`{bold.#:FF0000 hello}`, '\u001B[1m\u001B[48;2;255;0;0mhello\u001B[49m\u001B[22m');
	t.is(chalkTemplate`{bold.#00FF00:FF0000 hello}`, '\u001B[1m\u001B[38;2;0;255;0m\u001B[48;2;255;0;0mhello\u001B[49m\u001B[39m\u001B[22m');
	t.is(chalkTemplate`{#FF0000.bold hello}`, '\u001B[38;2;255;0;0m\u001B[1mhello\u001B[22m\u001B[39m');
	t.is(chalkTemplate`{#:FF0000.bold hello}`, '\u001B[48;2;255;0;0m\u001B[1mhello\u001B[22m\u001B[49m');
	t.is(chalkTemplate`{#00FF00:FF0000.bold hello}`, '\u001B[38;2;0;255;0m\u001B[48;2;255;0;0m\u001B[1mhello\u001B[22m\u001B[49m\u001B[39m');
});
