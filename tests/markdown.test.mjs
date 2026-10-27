import test from "node:test";
import assert from "node:assert/strict";

import {
  isSafeInlineMath,
  parseMarkdownBlocks,
  tokenizeInline,
} from "../lib/ai/markdown.mjs";

function mathTokens(tokens) {
  return tokens.filter((token) => token.type === "math");
}

test("renders the reported single-dollar inline examples as math", () => {
  const samples = [
    {
      input: "$v$ = Wave speed (measured in meters per second, $m/s$).",
      values: ["v", "m/s"],
    },
    {
      input: "$f$ = Frequency (measured in Hertz, $Hz$).",
      values: ["f", "Hz"],
    },
    {
      input: "$\\lambda$ (Lambda) = Wavelength (measured in meters, $m$).",
      values: ["\\lambda", "m"],
    },
  ];

  for (const sample of samples) {
    const tokens = tokenizeInline(sample.input);
    const math = mathTokens(tokens);

    assert.deepEqual(
      math.map((token) => token.value),
      sample.values,
      sample.input,
    );
    assert.ok(
      math.every((token) => token.display === false),
      sample.input,
    );
    assert.ok(
      tokens
        .filter((token) => token.type === "text")
        .every((token) => !token.value.includes("$")),
      sample.input,
    );
  }
});

test("preserves currency amounts as literal text", () => {
  const inputs = [
    "The fee is $5 and the total is $10.",
    "It costs $10.00 (about $5.00).",
    "$5$ and $10$",
    "$5-$10",
    "$5 to $10",
    "$5.00 USD and $10.00 USD",
    "$5 million",
  ];

  for (const input of inputs) {
    assert.equal(mathTokens(tokenizeInline(input)).length, 0, input);
  }
});

test("still parses math after a literal currency amount", () => {
  const tokens = tokenizeInline("He paid $5 and solved $x$.");
  const math = mathTokens(tokens);

  assert.deepEqual(
    math.map((token) => token.value),
    ["x"],
  );
  assert.equal(math[0].display, false);
});

test("preserves bold, italic, and inline code", () => {
  const tokens = tokenizeInline("**bold** *italic* `$v$` and $f$");

  assert.equal(tokens[0].type, "bold");
  assert.equal(tokens[0].value, "bold");
  assert.equal(tokens[2].type, "italic");
  assert.equal(tokens[2].value, "italic");
  assert.equal(tokens[4].type, "code");
  assert.equal(tokens[4].value, "$v$");

  const math = mathTokens(tokens);
  assert.deepEqual(
    math.map((token) => token.value),
    ["f"],
  );
});

test("parses escaped-parenthesis inline and display math", () => {
  const tokens = tokenizeInline("Inline \\(v\\) and display \\[x = 1\\].");
  const math = mathTokens(tokens);

  assert.equal(math.length, 2);
  assert.deepEqual(math[0], {
    type: "math",
    value: "v",
    display: false,
  });
  assert.deepEqual(math[1], {
    type: "math",
    value: "x = 1",
    display: true,
  });
});

test("marks the reported display equation as a display block", () => {
  const input = "\\[\\lambda = \\frac{v}{f}\\]";
  const blocks = parseMarkdownBlocks(input);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "math");
  assert.equal(blocks[0].display, true);
  assert.equal(blocks[0].content, "\\lambda = \\frac{v}{f}");
});

test("parses multi-line display math blocks", () => {
  const blocks = parseMarkdownBlocks("Before\n\n\\[\nx = 1\n\\]\n\nAfter");

  assert.deepEqual(
    blocks.map((block) => block.type),
    ["paragraph", "math", "paragraph"],
  );
  assert.equal(blocks[1].content, "x = 1");
});

test("parses dollar display blocks without leaking delimiters", () => {
  const blocks = parseMarkdownBlocks("$$x = 1$$");

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "math");
  assert.equal(blocks[0].content, "x = 1");
});

test("validates safe inline math without accepting currency", () => {
  assert.equal(isSafeInlineMath("v"), true);
  assert.equal(isSafeInlineMath("m/s"), true);
  assert.equal(isSafeInlineMath("\\lambda"), true);
  assert.equal(isSafeInlineMath("x = 5"), true);
  assert.equal(isSafeInlineMath("5"), false);
  assert.equal(isSafeInlineMath("5 and "), false);
  assert.equal(isSafeInlineMath("and"), false);
});

test("does not treat currency spanning bold and inline code as math", () => {
  const input =
    "Currency: $5 and $10. **bold** *italic* `$v$` and then $f$.";
  const tokens = tokenizeInline(input);
  const math = mathTokens(tokens);

  assert.deepEqual(
    math.map((token) => token.value),
    ["f"],
  );
  assert.ok(
    tokens.some(
      (token) => token.type === "code" && token.value === "$v$",
    ),
  );
  assert.ok(
    tokens.some(
      (token) => token.type === "bold" && token.value === "bold",
    ),
  );
  assert.ok(
    tokens.some(
      (token) => token.type === "italic" && token.value === "italic",
    ),
  );
});

test("does not treat currency followed by bold text as math", () => {
  const tokens = tokenizeInline("It costs $10. **Important** and $x");

  assert.equal(mathTokens(tokens).length, 0);
  assert.ok(
    tokens.some(
      (token) => token.type === "bold" && token.value === "Important",
    ),
  );
});

test("parses display math directly after a paragraph without a blank line", () => {
  const input = String.raw`Since the wave travels one wavelength per cycle:
\[v = f \times \lambda\]
This is the wave equation.`;

  const blocks = parseMarkdownBlocks(input);

  assert.deepEqual(
    blocks.map((block) => block.type),
    ["paragraph", "math", "paragraph"],
  );
  assert.equal(blocks[1].display, true);
  assert.equal(blocks[1].content, String.raw`v = f \times \lambda`);
});
