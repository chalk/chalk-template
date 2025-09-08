import type { ChalkInstance } from 'chalk';
import type { AstNode, Style } from './templateParser.js';

function configChalk(chalk: ChalkInstance, styles: Map<String, Style>) {
	let currentChalk = chalk;
	for (const style of styles.values()) {
		if (style.type === 'hexstyle') {
			if (style.fghex) {
				currentChalk = currentChalk.hex('#' + style.fghex);
			}
			if (style.bghex) {
				currentChalk = currentChalk.bgHex('#' + style.bghex);
			}
		} else if (style.type === 'rgbstyle') {
			if (style.bgRgb) {
				const { red, green, blue } = style.bgRgb;
				currentChalk = currentChalk.bgRgb(red, green, blue);
			}
			if (style.rgb) {
				const { red, green, blue } = style.rgb;
				currentChalk = currentChalk.rgb(red, green, blue);
			}
		} else if (style.type === 'textstyle') {
			currentChalk = currentChalk[style.value];
		}
	}
	return currentChalk;
}

export function renderChalk(chalk: ChalkInstance, node: AstNode): string {
	let styles = new Map<String, Style>();
	function visitor(current: AstNode) {
		if (current.type === 'template') return current.nodes.map(visitor).join('');
		else if (current.type === 'escapeme') return current.value;
		else if (current.type === 'text') return current.value;
		else if (current.type === 'chalktemplate') {
			const prevStyles = new Map<String, Style>(styles);

			for (const style of current.style) {
				const { type, key } = style;
				if (type === 'textstyle') {
					const { invert } = style;
					if (invert && styles.has(key)) {
						styles.delete(key);
						break;
					}
				}
				styles.set(key, style);
			}
			let result = '';
			for (const node of current.body) {
				if (node.type === 'chalktemplate') {
					result += visitor(node);
				} else {
					result += configChalk(chalk, styles)(node.value);
				}
			}
			styles = prevStyles;
			return result;
		}
		return '';
	}
	return visitor(node);
}
