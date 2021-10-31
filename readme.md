# chalk-template

> Use [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) with [Chalk](https://github.com/chalk/chalk)

## Install

```
$ npm install chalk-template
```

[`chalk`](https://github.com/chalk/chalk) is a required peer dependency.

## Usage

```js
import chalkTemplate from 'chalk-template';
import chalk from 'chalk';

const log = console.log;

log(chalkTemplate`
CPU: {red ${cpu.totalPercent}%}
RAM: {green ${ram.used / ram.total * 100}%}
DISK: {rgb(255,131,0) ${disk.used / disk.total * 100}%}
`);

log(chalk.red.bgBlack(chalkTemplate`2 + 3 = {bold ${2 + 3}}`));
```

## Related

- [chalk](https://github.com/chalk/chalk) - Terminal string styling done right
- [chalk-cli](https://github.com/chalk/chalk-cli) - Style text from the terminal

## Maintainers

- [Sindre Sorhus](https://github.com/sindresorhus)
- [Josh Junon](https://github.com/qix-)
