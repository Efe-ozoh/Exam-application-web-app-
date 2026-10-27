"use client";

import { Fragment, useMemo } from "react";
import { MathJax } from "better-react-mathjax";

import {
  parseMarkdownBlocks,
  tokenizeInline,
} from "@/lib/ai/markdown.mjs";

function renderInline(text, keyPrefix) {
  return tokenizeInline(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === "bold") {
      return (
        <strong key={key}>
          {renderInline(token.value, `${key}-strong`)}
        </strong>
      );
    }

    if (token.type === "italic") {
      return (
        <em key={key}>
          {renderInline(token.value, `${key}-em`)}
        </em>
      );
    }

    if (token.type === "code") {
      return (
        <code
          key={key}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800"
        >
          {token.value}
        </code>
      );
    }

    if (token.type === "math") {
      const tex = token.display
        ? `$$${token.value}$$`
        : `\\(${token.value}\\)`;

      return token.display ? (
        <MathJax key={key} dynamic>
          {tex}
        </MathJax>
      ) : (
        <MathJax key={key} inline dynamic>
          {tex}
        </MathJax>
      );
    }

    return <Fragment key={key}>{token.value}</Fragment>;
  });
}

const headingClasses = {
  1: "text-lg font-bold text-slate-900",
  2: "text-base font-bold text-slate-900",
  3: "text-sm font-bold text-slate-900",
  4: "text-sm font-semibold text-slate-900",
};

export default function MarkdownMessage({ content }) {
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

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
              <MathJax dynamic>{`$$${block.content}$$`}</MathJax>
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
