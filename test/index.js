import test from 'ava';
import {chalkTemplate, chalkTemplateStderr} from '../dist/index.js';

test('return an empty string for an empty literal', t => {
	t.is(chalkTemplate``, '');
});

test('return an empty string for an empty literal (stderr)', t => {
	t.is(chalkTemplateStderr``, '');
});


