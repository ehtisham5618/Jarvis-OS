import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
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
      {code}
    </SyntaxHighlighter>
  );
}
