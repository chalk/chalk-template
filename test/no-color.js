import test from 'ava';

import chalk from 'chalk'
import {chalkTemplate as chalkTemplateStdout, chalkTemplateStderr} from '../dist/index.js';


for (const [chalkTemplate, stdio] of [[chalkTemplateStdout, 'stdout'], [chalkTemplateStderr, 'stderr']]) {
	test(`[${stdio}] return a regular string for a literal with no templates`, t => {
		t.is(chalkTemplate`hello`, 'hello');
	});

	test(`[${stdio}]correctly perform template parsing`, t => {
		t.is(chalkTemplate`{bold Hello, {cyan World!} This is a} test. {green Woo!}`,
			chalk.bold('Hello,', chalk.cyan('World!'), 'This is a') + ' test. ' + chalk.green('Woo!'));
	});

	test(`[${stdio}]correctly perform template substitutions`, t => {
		const name = 'Sindre';
		const exclamation = 'Neat';
		t.is(chalkTemplate`{bold Hello, {cyan.inverse ${name}!} This is a} test. {green ${exclamation}!}`,
			chalk.bold('Hello,', chalk.cyan.inverse(name + '!'), 'This is a') + ' test. ' + chalk.green(exclamation + '!'));
	});

	test(`[${stdio}] correctly perform nested template substitutions`, t => {
		const name = 'Sindre';
		const exclamation = 'Neat';
		t.is(chalkTemplate`{bold Hello, {cyan.inverse ${name}!} This is a}` + ' test. ' + chalkTemplate`{green ${exclamation}!}`,
			chalk.bold('Hello,', chalk.cyan.inverse(name + '!'), 'This is a') + ' test. ' + chalk.green(exclamation + '!'));

		t.is(chalkTemplate`{red.bgGreen.bold Hello {italic.blue ${name}}}`,
			chalk.red.bgGreen.bold('Hello ' + chalk.italic.blue(name)));

		t.is(chalkTemplate`{strikethrough.cyanBright.bgBlack Works with {reset {bold numbers}} {bold.red ${1}}}`,
			chalk.strikethrough.cyanBright.bgBlack('Works with ' + chalk.reset.bold('numbers') + ' ' + chalk.bold.red(1)));
	});

	test(`[${stdio}] correctly parse newline literals (bug #184)`, t => {
		t.is(chalkTemplate`Hello
{red there}`, 'Hello\nthere');
	});

	test(`[${stdio}] correctly parse newline escapes (bug #177)`, t => {
		t.is(chalkTemplate`Hello\nthere!`, 'Hello\nthere!');
	});

	test(`[${stdio}] correctly parse escape in parameters (bug #177 comment 318622809)`, t => {
		const string = '\\';
		t.is(chalkTemplate`{blue ${string}}`, '\\');
	});

	test(`[${stdio}] correctly parses unicode/hex escapes`, t => {
		t.is(chalkTemplate`\u0078ylophones are fo\u0078y! {magenta.inverse \u0078ylophones are fo\u0078y!}`,
			'xylophones are foxy! xylophones are foxy!');
	});

	test(`[${stdio}] no error if extra } is found`, t => {
		t.is(chalkTemplate`{red hi!}}`, "hi!}");
	});

	test(`[${stdio}] should not parse upper-case escapes`, t => {
		t.is(chalkTemplate`\N\n\T\t\X07\u0007\U000A\u000A\U000a\u000A`, 'N\nT\tX07\u0007U000A\u000AU000a\u000A');
	});

	test(`[${stdio}] should properly handle undefined template interpolated values`, t => {
		t.is(chalkTemplate`hello ${undefined}`, 'hello undefined');
		t.is(chalkTemplate`hello ${null}`, 'hello null');
	});
}
