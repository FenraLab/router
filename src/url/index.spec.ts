import { assert } from "chai";

import { toTokens } from "./tokenizer";
import { toAST } from "./ast";
import { Interpret } from "./interpreter";
import { IInterpreterCursor } from "./types";

describe("URL", function () {
	describe("Input validation", function () {
		it("accepts", function () {
			const testSyntax = "/eln/:document/:section/:datum";
			console.log(testSyntax);

			const tokens = toTokens(testSyntax);
			console.log(tokens);

			const syntax = toAST(tokens);
			console.log(syntax);

			function test(input: string) {
				const cursor: IInterpreterCursor = {
					index: 0,
					params: {},
				};

				const accepts = Interpret(input, syntax, cursor);
				console.log(input, accepts);
			}

			test("/eln");
			test("/eln/document/section/datum");
		});
	});
});
