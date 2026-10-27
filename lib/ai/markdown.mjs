const MATH_INDICATOR = /[\\^_{}=+*/<>|%×÷±≤≥≠≈-]/;

function isEscaped(text, index) {
  let backslashes = 0;

  for (let i = index - 1; i >= 0 && text[i] === "\\"; i -= 1) {
    backslashes += 1;
  }

  return backslashes % 2 === 1;
}

export function isSafeInlineMath(content) {
  if (typeof content !== "string") return false;

  const value = content.trim();

  if (!value || /[\r\n]/.test(content)) return false;
  if (value.includes("`")) return false;
  if (/\*\*|__/.test(value)) return false;
  if (/^\d[\d,]*(?:\.\d+)?$/.test(value)) return false;
  if (/^(?:and|or|to|[-–—])$/i.test(value)) return false;
  if (/^\d/.test(value) && /\s/.test(value) && !MATH_INDICATOR.test(value)) {
    return false;
  }
  if (/\s/.test(value) && !MATH_INDICATOR.test(value) && !/\d/.test(value)) {
    return false;
  }

  return true;
}

function findSingleDollarMath(text, start) {
  if (isEscaped(text, start)) return null;

  let search = start + 1;

  while (search < text.length) {
    const nextCode = text.indexOf("`", search);
    const close = text.indexOf("$", search);

    if (nextCode !== -1 && (close === -1 || nextCode < close)) {
      const codeClose = text.indexOf("`", nextCode + 1);

      if (codeClose === -1) return null;

      search = codeClose + 1;
      continue;
    }

    if (close === -1) return null;

    if (isEscaped(text, close)) {
      search = close + 1;
      continue;
    }

    if (text[close + 1] === "$") {
      search = close + 2;
      continue;
    }

    if (/\d/.test(text[close + 1] ?? "")) return null;

    const content = text.slice(start + 1, close);

    if (!isSafeInlineMath(content)) return null;

    return { content: content.trim(), end: close + 1 };
  }

  return null;
}

function findSingleAsteriskClose(text, start) {
  for (let i = start; i < text.length; i += 1) {
    if (
      text[i] === "*" &&
      !isEscaped(text, i) &&
      text[i - 1] !== "*" &&
      text[i + 1] !== "*"
    ) {
      return i;
    }
  }

  return -1;
}

export function tokenizeInline(text) {
  const source = String(text ?? "");
  const tokens = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (!buffer) return;

    tokens.push({ type: "text", value: buffer });
    buffer = "";
  };

  while (index < source.length) {
    const char = source[index];

    if (char === "\\" && source[index + 1] === "$") {
      buffer += "$";
      index += 2;
      continue;
    }

    if (char === "`") {
      const close = source.indexOf("`", index + 1);

      if (close !== -1) {
        flush();
        tokens.push({ type: "code", value: source.slice(index + 1, close) });
        index = close + 1;
        continue;
      }
    }

    if (char === "*" || char === "_") {
      if (source.startsWith(char + char, index)) {
        const close = source.indexOf(char + char, index + 2);

        if (close !== -1) {
          flush();
          tokens.push({
            type: "bold",
            value: source.slice(index + 2, close),
          });
          index = close + 2;
          continue;
        }
      }

      if (char === "*") {
        const close = findSingleAsteriskClose(source, index + 1);

        if (close !== -1) {
          flush();
          tokens.push({
            type: "italic",
            value: source.slice(index + 1, close),
          });
          index = close + 1;
          continue;
        }
      }
    }

    if (char === "$") {
      if (source[index + 1] === "$") {
        const close = source.indexOf("$$", index + 2);

        if (close !== -1) {
          flush();
          tokens.push({
            type: "math",
            value: source.slice(index + 2, close).trim(),
            display: true,
          });
          index = close + 2;
          continue;
        }
      } else {
        const math = findSingleDollarMath(source, index);

        if (math) {
          flush();
          tokens.push({
            type: "math",
            value: math.content,
            display: false,
          });
          index = math.end;
          continue;
        }
      }
    }

    if (char === "\\" && source[index + 1] === "(") {
      const close = source.indexOf("\\)", index + 2);

      if (close !== -1) {
        flush();
        tokens.push({
          type: "math",
          value: source.slice(index + 2, close).trim(),
          display: false,
        });
        index = close + 2;
        continue;
      }
    }

    if (char === "\\" && source[index + 1] === "[") {
      const close = source.indexOf("\\]", index + 2);

      if (close !== -1) {
        flush();
        tokens.push({
          type: "math",
          value: source.slice(index + 2, close).trim(),
          display: true,
        });
        index = close + 2;
        continue;
      }
    }

    buffer += char;
    index += 1;
  }

  flush();
  return tokens;
}

function startsBlock(line) {
  const trimmed = line.trim();

  return (
    /^#{1,4}\s+/.test(trimmed) ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+[.)]\s+/.test(trimmed) ||
    /^>\s?/.test(trimmed) ||
    /^```/.test(trimmed) ||
    trimmed.startsWith("$$") ||
    trimmed.startsWith("\\[")
  );
}

function readMathBlock(lines, index, open, close) {
  const first = lines[index].trim().slice(open.length);
  const content = [];
  const closesOnSameLine = first.endsWith(close);

  if (closesOnSameLine) {
    content.push(first.slice(0, -close.length));
    return { content: content.join("\n").trim(), nextIndex: index + 1 };
  }

  content.push(first);
  let nextIndex = index + 1;

  while (nextIndex < lines.length) {
    const current = lines[nextIndex].trim();

    if (current.endsWith(close)) {
      content.push(current.slice(0, -close.length));
      nextIndex += 1;
      break;
    }

    content.push(current);
    nextIndex += 1;
  }

  return { content: content.join("\n").trim(), nextIndex };
}

export function parseMarkdownBlocks(text) {
  const lines = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const code = [];
      index += 1;

      while (
        index < lines.length &&
        !lines[index].trim().startsWith("```")
      ) {
        code.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push({ type: "code", content: code.join("\n") });
      continue;
    }

    if (trimmed.startsWith("$$")) {
      const math = readMathBlock(lines, index, "$$", "$$");
      blocks.push({ type: "math", content: math.content, display: true });
      index = math.nextIndex;
      continue;
    }

    if (trimmed.startsWith("\\[")) {
      const math = readMathBlock(lines, index, "\\[", "\\]");
      blocks.push({ type: "math", content: math.content, display: true });
      index = math.nextIndex;
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);

    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        content: heading[2],
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote = [];

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "quote", content: quote.join(" ") });
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items = [];

      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items = [];

      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph = [trimmed];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !startsBlock(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: "paragraph", content: paragraph.join(" ") });
  }

  return blocks;
}
