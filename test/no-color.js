import test from 'ava';
import chalk from 'chalk';
import chalkTemplate from '../index.js';

test('return a regular string for a literal with no templates', t => {
	t.is(chalkTemplate`hello`, 'hello');
});

test('correctly perform template parsing', t => {
	t.is(chalkTemplate`{bold Hello, {cyan World!} This is a} test. {green Woo!}`,
		chalk.bold('Hello,', chalk.cyan('World!'), 'This is a') + ' test. ' + chalk.green('Woo!'));
});

test('correctly perform template substitutions', t => {
	const name = 'Sindre';
	const exclamation = 'Neat';
	t.is(chalkTemplate`{bold Hello, {cyan.inverse ${name}!} This is a} test. {green ${exclamation}!}`,
		chalk.bold('Hello,', chalk.cyan.inverse(name + '!'), 'This is a') + ' test. ' + chalk.green(exclamation + '!'));
});

test('correctly perform nested template substitutions', t => {
	const name = 'Sindre';
	const exclamation = 'Neat';
	t.is(chalkTemplate`{bold Hello, {cyan.inverse ${name}!} This is a}` + ' test. ' + chalkTemplate`{green ${exclamation}!}`,
		chalk.bold('Hello,', chalk.cyan.inverse(name + '!'), 'This is a') + ' test. ' + chalk.green(exclamation + '!'));

	t.is(chalkTemplate`{red.bgGreen.bold Hello {italic.blue ${name}}}`,
		chalk.red.bgGreen.bold('Hello ' + chalk.italic.blue(name)));

	t.is(chalkTemplate`{strikethrough.cyanBright.bgBlack Works with {reset {bold numbers}} {bold.red ${1}}}`,
		chalk.strikethrough.cyanBright.bgBlack('Works with ' + chalk.reset.bold('numbers') + ' ' + chalk.bold.red(1)));
});

test('correctly parse newline literals (bug #184)', t => {
	t.is(chalkTemplate`Hello
{red there}`, 'Hello\nthere');
});

test('correctly parse newline escapes (bug #177)', t => {
	t.is(chalkTemplate`Hello\nthere!`, 'Hello\nthere!');
});

test('correctly parse escape in parameters (bug #177 comment 318622809)', t => {
	const string = '\\';
	t.is(chalkTemplate`{blue ${string}}`, '\\');
});

test('correctly parses unicode/hex escapes', t => {
	t.is(chalkTemplate`\u0078ylophones are fo\u0078y! {magenta.inverse \u0078ylophones are fo\u0078y!}`,
		'xylophones are foxy! xylophones are foxy!');
});

test('throws if an extra unescaped } is found', t => {
	t.throws(() => {
		// eslint-disable-next-line no-unused-expressions
		chalkTemplate`{red hi!}}`;
	}, {
		message: 'Found extraneous } in Chalk template literal',
	});
});

test('should not parse upper-case escapes', t => {
	t.is(chalkTemplate`\N\n\T\t\X07\u0007\U000A\u000A\U000a\u000A`, 'N\nT\tX07\u0007U000A\u000AU000a\u000A');
});

test('should properly handle undefined template interpolated values', t => {
	t.is(chalkTemplate`hello ${undefined}`, 'hello undefined');
	t.is(chalkTemplate`hello ${null}`, 'hello null');
});
