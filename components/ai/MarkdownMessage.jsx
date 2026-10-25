"use client";

import { Fragment, useMemo } from "react";
import { MathJax } from "better-react-mathjax";

const INLINE_PATTERN =
  /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\*[^*\n]+\*)/g;

function renderInline(text, keyPrefix) {
  return text.split(INLINE_PATTERN).map((part, index) => {
    if (!part) return null;

    const key = `${keyPrefix}-${index}`;

    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return (
        <strong key={key}>
          {renderInline(part.slice(2, -2), `${key}-strong`)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={key}>
          {renderInline(part.slice(1, -1), `${key}-em`)}
        </em>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (
      (part.startsWith("\\(") && part.endsWith("\\)")) ||
      (part.startsWith("\\[") && part.endsWith("\\]")) ||
      (part.startsWith("$$") && part.endsWith("$$"))
    ) {
      return (
        <MathJax key={key} inline dynamic>
          {part}
        </MathJax>
      );
    }

    return <Fragment key={key}>{part}</Fragment>;
  });
}

function startsBlock(line) {
  const trimmed = line.trim();

  return (
    /^#{1,4}\s+/.test(trimmed) ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+[.)]\s+/.test(trimmed) ||
    /^>\s?/.test(trimmed) ||
    /^```/.test(trimmed) ||
    trimmed.startsWith("$$")
  );
}

function parseBlocks(text) {
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
      const math = [trimmed];
      const closesOnSameLine = trimmed.length > 2 && trimmed.endsWith("$$");

      index += 1;

      if (!closesOnSameLine) {
        while (index < lines.length) {
          const mathLine = lines[index].trim();
          math.push(mathLine);
          index += 1;

          if (mathLine.endsWith("$$")) break;
        }
      }

      blocks.push({ type: "math", content: math.join("\n") });
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

const headingClasses = {
  1: "text-lg font-bold text-slate-900",
  2: "text-base font-bold text-slate-900",
  3: "text-sm font-bold text-slate-900",
  4: "text-sm font-semibold text-slate-900",
};

export default function MarkdownMessage({ content }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[0.95rem]">
      {blocks.map((block, index) => {
        if (block.type === "math") {
          return (
            <div
              key={index}
              className="overflow-x-auto rounded-lg bg-white/70 px-3 py-2 text-slate-800"
            >
              <MathJax dynamic>{block.content}</MathJax>
            </div>
          );
        }

        if (block.type === "heading") {
          const Tag = `h${Math.min(block.level + 2, 6)}`;

          return (
            <Tag
              key={index}
              className={headingClasses[block.level] ?? headingClasses[3]}
            >
              {renderInline(block.content, `h-${index}`)}
            </Tag>
          );
        }

        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type === "ul" ? "ul" : "ol";

          return (
            <Tag
              key={index}
              className={`space-y-1.5 pl-5 ${
                block.type === "ul" ? "list-disc" : "list-decimal"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {renderInline(item, `li-${index}-${itemIndex}`)}
                </li>
              ))}
            </Tag>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-blue-200 pl-3 text-slate-600"
            >
              {renderInline(block.content, `q-${index}`)}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
            >
              <code>{block.content}</code>
            </pre>
          );
        }

        return (
          <p key={index}>{renderInline(block.content, `p-${index}`)}</p>
        );
      })}
    </div>
  );
}
