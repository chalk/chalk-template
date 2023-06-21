import { chalkTemplateRenderer } from "../dist/index.js";
import { Chalk } from "chalk";
import util  from "node:util";

const prefix = "{";
function toString(node) {
	function visitor(current) {
		if (current.type === "template") return current.nodes.map(visitor).join("");
		else if (current.type === "escapeme") return current.value;
		else if (current.type === "text") return current.value;
		else if (current.type === "chalktemplate")
			return `${prefix}${current.style.map(visitor).join(".")} ${current.body
				.map(visitor)
				.join("")}}`;
		else if (current.type === "textstyle") {
			return `${current.invert ? "~" : ""}${current.value}`;
		} else if (current.type === "hexstyle") {
			if (current.fghex && current.bghex)
				return "#" + current.fghex + ":" + current.bghex;
			else if (current.fghex && !current.bghex) return "#" + current.fghex;
			else if (!current.fghex && current.bghex) return "#:" + current.bghex;
		} else if (current.type === "rgbstyle") {
			if (current.rgb) {
				const { red, green, blue } = current.rgb;
				return `rgb(${red},${green},${blue})`;
			} else {
				const { red, green, blue } = current.bgRgb;
				return `bgRgb(${red},${green},${blue})`;
			}
		}

		return "";
	}
	return visitor(node);
}

const debugRender = chalkTemplateRenderer(new Chalk(), { returnAstNode: true });

function test(result) {
	debugger
	const ast = result.ast;
	const rendered = result.rendered;
	const templateString = ast.templateString;

	console.log(util.inspect(ast, {depth: null, colors: true}))
	console.log("template", templateString);
	console.log("toString", toString(ast));
	console.log(rendered);
}

function testRandom() {
	test(debugRender`{strikethrough.cyanBright.bgBlue ok {~strikethrough two}}`);
	test(debugRender`{bold.rgb (144 ,10,178).inverse Hello, {~inverse there!}}`);
	test(
		debugRender`{strikethrough.cyanBright.bgBlack Works with {reset {bold numbers}} {bold.red ${1}}}`
	);
	test(debugRender`{bold.bgRgb (144 ,10,178) Hello, there!}`);
	test(debugRender`{bold hello \\{in brackets\\}}`);
	test(debugRender`{abadstylethatdoesntexist this shouldn\'t work ever}`);
	test(debugRender`\u{AB}`);
	test(debugRender`This is a {bold \u{AB681}} test`);
	test(debugRender`{#FF0000 hello}`);
	test(debugRender`{#CCAAFF:AABBCC hello}`);
	test(debugRender`{#X:Y hello}`);
	test(debugRender`{bold hello`);
}

function testHex() {
	test(debugRender`{#:FF0000 hello}`);
	test(debugRender`{#00FF00:FF0000 hello}`);
	test(debugRender`{bold.#FF0000 hello}`);
	test(debugRender`{bold.#:FF0000 hello}`);
	test(debugRender`{bold.#00FF00:FF0000 hello}`);
	test(debugRender`{#FF0000.bold hello}`);
	test(debugRender`{#:FF0000.bold hello}`);
	test(debugRender`{#00FF00:FF0000.bold hello}`);
}
function testFn() {xo
	test(debugRender`debugRender`);
	test(debugRender`b${"c"}`);
	test(debugRender`${"d"}`);
	test(debugRender`${"e"}${"f"}`);
	test(debugRender`\b`);
	test(debugRender`${8}`);
	test(debugRender("hi"));
	test(debugRender("hi", "a"));
}

function debug() {
	testRandom();
	testHex();
	testFn()
}

// debug()
test(debugRender`{bold.rgb(144,10,178).inverse Hello, {~inverse there!}}`)
test(debugRender`{bold.bgRgb(144,10,178).inverse Hello, {~inverse there!}}`)