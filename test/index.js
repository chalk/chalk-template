import test from 'ava';
import chalkTemplate from '../index.js';

test('return an empty string for an empty literal', t => {
	t.is(chalkTemplate``, '');
});
