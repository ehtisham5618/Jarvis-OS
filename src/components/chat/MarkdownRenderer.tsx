/**
 * MarkdownRenderer
 *
 * Renders AI-generated markdown with full syntax highlighting,
 * copy-to-clipboard on code blocks, and styled GFM elements.
 */

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white/90"
      title="Copy code"
    >
      {copied ? (
        <>
          <Check className="size-3 text-[#4ade80]" />
          <span className="text-[#4ade80]">Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={[
        "prose prose-invert max-w-none text-sm leading-relaxed",
        "prose-p:my-2 prose-p:text-white/85",
        "prose-headings:text-white prose-headings:font-medium",
        "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
        "prose-strong:text-white prose-em:text-white/80",
        "prose-a:text-[#61c7ff] prose-a:no-underline hover:prose-a:underline",
        "prose-blockquote:border-l-[#4f7dff] prose-blockquote:text-white/60",
        "prose-hr:border-white/10",
        "prose-ul:my-2 prose-ol:my-2",
        "prose-li:text-white/85 prose-li:my-0.5",
        "prose-table:text-sm",
        "prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2",
        "prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node: _node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            const codeString = String(children).replace(/\n$/, "");

            if (isInline) {
              return (
                <code
                  className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.82em] text-[#61c7ff]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const language = match[1];

            return (
              <div className="not-prose my-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0f12]">
                {/* Code block header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-white/40">
                    {language}
                  </span>
                  <CopyButton code={codeString} />
                </div>
                {/* Syntax-highlighted code */}
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "transparent",
                    fontSize: "0.8rem",
                    lineHeight: "1.6",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          },
          // Styled table wrapper
          table({ children }) {
            return (
              <div className="not-prose my-3 overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full">{children}</table>
              </div>
            );
          },
          // Styled blockquote
          blockquote({ children }) {
            return (
              <blockquote className="not-prose my-3 border-l-2 border-[#4f7dff] pl-4 text-sm text-white/60 italic">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
