import type { ChalkInstance } from 'chalk';

export interface TemplateNode {
	type: 'template';
	nodes: AstNode[];
	templateString: string;
}

export interface ChalkTemplate {
	type: 'chalktemplate';
	style: Style[];
	body: ChalkTemplateBodyNode[];
}

export interface EscapeMeNode {
	type: 'escapeme';
	value: string;
}
export interface TextNode {
	type: 'text';
	value: string;
}

export type AstNode = TemplateNode | ChalkTemplate | EscapeMeNode | TextNode;

export type ChalkTemplateBodyNode = ChalkTemplate | EscapeMeNode | TextNode;

export interface TextStyle {
	type: 'textstyle';
	invert: boolean;
	value: string;
	key: string;
}
export interface RgbStyle {
	type: 'rgbstyle';
	key: string;
	rgb?: RGB;
	bgRgb?: RGB;
}
export interface RGB {
	red: number;
	green: number;
	blue: number;
}
export interface HexStyle {
	type: 'hexstyle';
	key: string;
	fghex?: string;
	bghex?: string;
}
export type Style = TextStyle | RgbStyle | HexStyle;

const prefix = '{';

export function parse(
	chalk: ChalkInstance,
	templateString: string
): TemplateNode {
	let position = 0;

	return parseTemplate();

	function parseTemplate(): TemplateNode {
		const nodes: AstNode[] = [];
		for (;;) {
			const node = parseNode();
			if (!node) break;
			nodes.push(node);
		}
		return {
			type: 'template',
			nodes,
			templateString,
		};
	}

	function parseNode(): ChalkTemplate | EscapeMeNode | TextNode | undefined {
		return parseChalkTemplate() ?? parseEscapeme() ?? parseText();
	}

	function parseChalkTemplate(): ChalkTemplate | undefined {
		const original = position;
		let body: ChalkTemplateBodyNode[] = [];
		let style: Style[] | undefined;
		if (consume(prefix)) {
			style = parseStyles();
			if (!style) return reset(original);
			let ended = false;
			for (;;) {
				const node = parseNode();
				if (node && node.type === 'escapeme' && node.value === '}') {
					ended = true;
					break;
				}
				if (!node) break;
				body.push(node);
			}
			if (!ended && !consume('}')) return reset(original);
			return {
				type: 'chalktemplate',
				style,
				body,
			};
		}
		return undefined;
	}

	function parseEscapeme(): EscapeMeNode | undefined {
		const escapeNode = (value: string): EscapeMeNode => {
			return { type: 'escapeme', value };
		};
		if (consume('{')) return escapeNode('{');
		else if (consume('}')) return escapeNode('}');
		else if (consume('\\')) return escapeNode('\\');
		return undefined;
	}

	function parseText(): TextNode {
		const textmatcher = () => {
			let match = '';
			return (char: string) => {
				if ((match + char).endsWith(prefix))
					return {
						kind: 'reject',
						amount: prefix.length - 1,
					};
				if (/[^{}\\]/.test(char)) {
					match += char;
					return true;
				}
				return false;
			};
		};
		const value = consumeWhile(textmatcher());
		if (value === undefined) return undefined;

		return {
			type: 'text',
			value,
		};
	}

	function parseStyles(): Style[] | undefined {
		const original = position;
		const styles: Style[] = [];
		for (;;) {
			const style =
				parseHexStyle() ??
				parseRgbStyle('rgb') ??
				parseRgbStyle('bgRgb') ??
				parseTextStyle();
			if (!style) break;
			styles.push(style);
			if (!consume('.')) break;
		}
		// There must be whitespace following the style, to delineate end of style
		// If the whitespace is ' ', then it is swallowed, otherwise it is preserved
		const nextSpace = consumeNextWhitespace();
		if (!nextSpace) return reset(original);
		if (nextSpace !== ' ') {
			position--;
		}
		if (styles.length === 0) return undefined;
		return styles;
	}

	function parseHexStyle(): HexStyle | undefined {
		const original = position;
		const hash = consume('#');
		if (hash) {
			const fghex = consumeWhile((char) => /[0-9a-fA-F]/.test(char));
			let bghex: string | undefined;
			if (consume(':')) {
				bghex = consumeWhile((char) => /[0-9a-fA-F]/.test(char));
				if (!bghex) return reset(original);
			} else {
				// no seperator, that means there must be a foreground value
				if (!fghex) return reset(original);
			}
			return {
				type: 'hexstyle',
				fghex,
				bghex,
				key: `fghex:${fghex}:bghex:${bghex}`
			};
		}
		return undefined;
	}
	function parseRgbStyle(kind: 'rgb' | 'bgRgb'): RgbStyle | undefined {
		const original = position;
		const rgb = consume(kind);
		if (rgb) {
			consumeWhitespace();
			const lparen = consume('(');
			if (!lparen) reset(original);
			consumeWhitespace();
			const red = consumeNumber();
			if (!red) reset(original);
			consumeWhitespace();
			consume(',');
			consumeWhitespace();
			const green = consumeNumber();
			if (!green) reset(original);
			consumeWhitespace();
			consume(',');
			consumeWhitespace();
			const blue = consumeNumber();
			if (!blue) reset(original);
			consumeWhitespace();
			const rparen = consume(')');
			if (!rparen) reset(original);
			return {
				type: 'rgbstyle',
				[kind]: {
					red,
					green,
					blue,
				},
				key: `rgb:${kind}:${red}:${green}:${blue}`
			};
		}
		return undefined;
	}

	function parseTextStyle(): TextStyle | undefined {
		const original = position;
		const invert = consume('~');
		const style = consumeWhile((char) => /[^\s#\\.]/.test(char));
		if (!style) return reset(original);
		if (!chalk[style]) return reset(original);
		return {
			type: 'textstyle',
			invert: !!invert,
			value: style,
			key: `text:${style}`
		};
	}

	function consumeNextWhitespace() {
		const nextWhiteSpace = () => {
			let limit = 1;
			return (char: string) => {
				if (limit === 0) return false;
				limit--;
				return /\s/.test(char);
			};
		};
		return consumeWhile(nextWhiteSpace());
	}

	function consume(segment: string): boolean | undefined {
		for (let j = 0; j < segment.length; j++) {
			if (templateString[position + j] !== segment[j]) {
				return undefined;
			}
		}
		position += segment.length;
		return true;
	}

	function consumeWhile(
		fn: (char: string) => boolean | { kind: string; amount: number }
	): string | undefined {
		let newIndex = position;
		let adjust = 0;
		while (templateString[newIndex] != null) {
			const action = fn(templateString[newIndex]);
			if (action === true) newIndex++;
			else if (action === false) break;
			else if (action.kind === 'reject') {
				adjust = -action.amount;
				break;
			}
		}
		if (newIndex > position) {
			const result = templateString.substring(position, newIndex + adjust);
			position = newIndex + adjust;
			return result;
		}
		return undefined;
	}

	function reset(index: number): undefined {
		position = index;
		return undefined;
	}

	function consumeNumber() {
		return consumeWhile((char) => /\d/.test(char));
	}

	function consumeWhitespace() {
		consumeWhile((char) => /\s/.test(char));
	}
}
