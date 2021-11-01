import test from 'ava';
import chalkTemplate from '../index.js';

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

test('properly handle escapes', t => {
	t.is(chalkTemplate`{bold hello \{in brackets\}}`,
		'\u001B[1mhello {in brackets}\u001B[22m');
});

test('throw if there is an unclosed block', t => {
	t.throws(() => {
		// eslint-disable-next-line no-unused-expressions
		chalkTemplate`{bold this shouldn't work ever\}`;
	}, {
		message: 'Chalk template literal is missing 1 closing bracket (`}`)',
	});

	t.throws(() => {
		// eslint-disable-next-line no-unused-expressions
		chalkTemplate`{bold this shouldn't {inverse appear {underline ever\} :) \}`;
	}, {
		message: 'Chalk template literal is missing 3 closing brackets (`}`)',
	});
});

test('throw if there is an invalid style', t => {
	t.throws(() => {
		// eslint-disable-next-line no-unused-expressions
		chalkTemplate`{abadstylethatdoesntexist this shouldn't work ever}`;
	}, {
		message: 'Unknown Chalk style: abadstylethatdoesntexist',
	});
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

test('escape interpolated values', t => {
	t.is(chalkTemplate`Hello {bold hi}`, 'Hello \u001B[1mhi\u001B[22m');
	t.is(chalkTemplate`Hello ${'{bold hi}'}`, 'Hello {bold hi}');
});

test('should allow bracketed Unicode escapes', t => {
	t.is(chalkTemplate`\u{AB}`, '\u{AB}');
	t.is(chalkTemplate`This is a {bold \u{AB681}} test`, 'This is a \u001B[1m\u{AB681}\u001B[22m test');
	t.is(chalkTemplate`This is a {bold \u{10FFFF}} test`, 'This is a \u001B[1m\u{10FFFF}\u001B[22m test');
});
