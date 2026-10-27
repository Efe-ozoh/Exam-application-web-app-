export type InlineToken =
  | { type: "text" | "bold" | "italic" | "code"; value: string }
  | { type: "math"; value: string; display: boolean };

export type MarkdownBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: number; content: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; content: string }
  | { type: "code"; content: string }
  | { type: "math"; content: string; display: boolean };

export function isSafeInlineMath(content: string): boolean;
export function tokenizeInline(text: string): InlineToken[];
export function parseMarkdownBlocks(text: string): MarkdownBlock[];
