import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, and `code` into React elements.
 * Guarantees no raw asterisks remain visible.
 */
function parseInline(text: string): React.ReactNode[] {
  // Regex matches:
  // 1. ***bold italic***
  // 2. **bold** or __bold__
  // 3. *italic* or _italic_
  // 4. `code`
  const regex = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
      const inner = part.slice(3, -3);
      return (
        <strong key={index} className="md-bold">
          <em className="md-italic">{inner}</em>
        </strong>
      );
    }

    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return <strong key={index} className="md-bold">{inner}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return <code key={index} className="md-code">{inner}</code>;
    }

    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return <em key={index} className="md-italic">{inner}</em>;
    }

    // Sanitize any remaining unclosed or stray asterisks
    const sanitized = part.replace(/\*\*/g, "").replace(/\*/g, "");
    return <React.Fragment key={index}>{sanitized}</React.Fragment>;
  });
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      const listKey = `list-${elements.length}`;
      if (isNumberedList) {
        elements.push(
          <ol key={listKey} className="md-ol">
            {currentListItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={listKey} className="md-ul">
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // 1. Markdown Headings (# , ## , ### )
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h4 key={`h4-${idx}`} className="md-h4">
          {parseInline(line.slice(4))}
        </h4>
      );
      return;
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h3 key={`h3-${idx}`} className="md-h3">
          {parseInline(line.slice(3))}
        </h3>
      );
      return;
    }

    if (line.startsWith("# ")) {
      flushList();
      elements.push(
        <h2 key={`h2-${idx}`} className="md-h2">
          {parseInline(line.slice(2))}
        </h2>
      );
      return;
    }

    // 2. Standalone Bold Heading (e.g. **Section 1(k)** or **Chapter Preliminary**)
    const boldHeaderMatch = line.match(/^\*\*([^*]+)\*\*$/);
    if (boldHeaderMatch) {
      flushList();
      elements.push(
        <h3 key={`sh-${idx}`} className="md-section-header">
          {boldHeaderMatch[1].trim()}
        </h3>
      );
      return;
    }

    // 3. Standalone Italic Subtitle (e.g. *Gazette of India...*)
    const italicSubMatch = line.match(/^\*([^*]+)\*$/);
    if (italicSubMatch) {
      flushList();
      elements.push(
        <div key={`sub-${idx}`} className="md-subtitle">
          {italicSubMatch[1].trim()}
        </div>
      );
      return;
    }

    // 4. Bracketed metadata (e.g. [25 December 2023])
    const metaTagMatch = line.match(/^\[([^\]]+)\]$/);
    if (metaTagMatch) {
      flushList();
      elements.push(
        <div key={`meta-${idx}`} className="md-meta-tag">
          {metaTagMatch[1].trim()}
        </div>
      );
      return;
    }

    // 5. Legal Clauses (e.g. "1. (1) ...", "(2) ...", "(a) ...")
    const clauseMatch = line.match(/^((?:\d+\.\s*)?\([0-9a-zA-ZivxIVX]{1,5}\))\s+(.*)$/);
    if (clauseMatch) {
      flushList();
      const clauseNum = clauseMatch[1].trim();
      const clauseBody = clauseMatch[2].trim();
      elements.push(
        <div key={`clause-${idx}`} className="md-legal-clause">
          <span className="md-clause-number">{clauseNum}</span>
          <div className="md-clause-content">{parseInline(clauseBody)}</div>
        </div>
      );
      return;
    }

    // 6. Numbered items: 1. , 2. , 3. , etc. (Explicit serial number preservation)
    const numberedMatch = line.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numberedMatch) {
      flushList();
      const numStr = numberedMatch[1];
      elements.push(
        <div key={`num-item-${idx}`} className="md-numbered-item">
          <span className="md-item-number">{numStr}.</span>
          <div className="md-item-content">{parseInline(numberedMatch[2].trim())}</div>
        </div>
      );
      return;
    }

    // 7. Bullet lists: -, *, •
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      flushList();
      const bulletContent = line.slice(2).trim();
      currentListItems.push(
        <li key={`li-${idx}`} className="md-li">
          {parseInline(bulletContent)}
        </li>
      );
      return;
    }

    // 8. Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="md-p">
        {parseInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`markdown-body ${className}`}>{elements}</div>;
}
