import test from 'ava';
import chalk from 'chalk';
import chalkTemplate, {chalkTemplateStderr, makeTaggedTemplate} from '../index.js';

test('return an empty string for an empty literal', t => {
	t.is(chalkTemplate``, '');
});

test('return an empty string for an empty literal (stderr)', t => {
	t.is(chalkTemplateStderr``, '');
});

test('return an empty string for an empty literal (chalk)', t => {
	t.is(makeTaggedTemplate(chalk)``, '');
});
