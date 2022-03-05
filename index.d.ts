/**
Terminal string styling with [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)

@example
```
import chalkTemplate from 'chalk-template';

log(chalkTemplate`
CPU: {red ${cpu.totalPercent}%}
RAM: {green ${ram.used / ram.total * 100}%}
DISK: {rgb(255,131,0) ${disk.used / disk.total * 100}%}
`);
```

@example
```
import chalkTemplate from 'chalk-template';
import chalk from 'chalk';

log(chalk.red.bgBlack(chalkTemplate`2 + 3 = {bold ${2 + 3}}`));
```
*/
export default function chalkTemplate(text: TemplateStringsArray, ...placeholders: unknown[]): string;

/**
Terminal string styling.

This function can be useful if you need to wrap the template function. However, prefer the default export whenever possible.

__Note:__ It's up to you to properly escape the input.

@example
```
import {template} from 'chalk-template';

console.log(template('Today is {red hot}'));
```
*/
export function template(text: string): string;
