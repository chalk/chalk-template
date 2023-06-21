import { Chalk, chalkStderr, type ChalkInstance } from "chalk";
import { parse, type AstNode } from "./templateParser.js";
import { renderChalk } from "./templateRenderer.js";

interface ChalkResult {
	rendered: String;
	ast: AstNode;
}
function renderer(
	chalk: ChalkInstance,
	options?: { ["returnAstNode"]: boolean }
) {
	function renderTaggedTemplate(...args: any[]): String;
	function renderTaggedTemplate(
		pieces: TemplateStringsArray,
		...args: any[]
	): String | ChalkResult {
		let msg: string;
		const lastIdx = pieces.length - 1;
		if (
			Array.isArray(pieces) &&
			pieces.every(isString) &&
			lastIdx === args.length
		) {
			msg =
				args.map((a, i) => pieces[i] + stringify(a)).join("") + pieces[lastIdx];
		} else {
			msg = [pieces, ...args.map(stringify)].join(" ");
		}
		const ast = parse(chalk, msg);
		const rendered = renderChalk(chalk, ast);
		if (options && options.returnAstNode) {
			return { rendered, ast };
		}
		return rendered;
	}
	return renderTaggedTemplate;
}

function stringify(arg: any) {
	return `${arg}`;
}

function isString(obj: any) {
	return typeof obj === "string";
}

export const chalkTemplateWithChalk = (chalk: ChalkInstance) => renderer(chalk);
export const chalkTemplate = renderer(new Chalk());
export const chalkTemplateStderr = renderer(chalkStderr);
/**
 * The AST is EXPERIMENTAL and subject to chance. 
 */
export const chalkTemplateRenderer = renderer;
