import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sourcedown } from "../src";
import "./style.css";

const staticSample = `# sourcedown

source-mode markdown renderer for AI streaming output.

## what it does

**all markdown source characters stay visible** while the text gets semantic styling.

- raw markdown remains selectable and copyable
- _italic_, **bold**, and \`inline code\` all styled with markers intact
- streaming append uses incremental CodeMirror transactions

## code highlighting

\`\`\`ts
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}
\`\`\`

\`\`\`json
{
  "name": "sourcedown",
  "type": "module"
}
\`\`\`

## links

[open documentation](https://github.com/sourcedown) are clickable but copy as raw source.

## blockquotes

> sourcedown sits between plain source and full WYSIWYG — source text stays the UI, but semantic styling makes it readable.

## lists

1. install: \`npm install sourcedown\`
2. import the component and styles
3. pass the \`markdown\` prop

---

horizontal rules are also styled.
`;

const streamingSample = `# AI streaming demo

This message is being streamed **token by token**.

Watch how incomplete markdown stays visible during generation:

- list items appear as they stream
- \`inline code\` markers stay visible
- [links](https://example.com) are clickable once complete

\`\`\`ts
const response = await fetch("/api/chat");
const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setMarkdown((prev) => prev + decoder.decode(value));
}
\`\`\`

> copy any text above — you'll get the raw markdown source.
`;

function StaticDemo() {
  return (
    <section>
      <h2>static</h2>
      <Sourcedown markdown={staticSample} />
    </section>
  );
}

function StreamingDemo() {
  const [markdown, setMarkdown] = useState("");
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setMarkdown("");
    setRunning(true);
    let index = 0;
    intervalRef.current = setInterval(() => {
      index += 3;
      setMarkdown(streamingSample.slice(0, index));
      if (index >= streamingSample.length) {
        clearInterval(intervalRef.current!);
        setRunning(false);
      }
    }, 20);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMarkdown("");
    setRunning(false);
  }

  return (
    <section>
      <h2>streaming</h2>
      <div className="demo-controls">
        <button onClick={start} disabled={running}>
          {running ? "streaming…" : "start stream"}
        </button>
        <button onClick={reset} disabled={!markdown && !running}>
          reset
        </button>
      </div>
      <Sourcedown markdown={markdown} />
    </section>
  );
}

function LinkDemo() {
  const [lastHref, setLastHref] = useState<string | null>(null);

  return (
    <section>
      <h2>custom link handler</h2>
      <Sourcedown
        markdown={
          "click [example.com](https://example.com) or [github.com](https://github.com)"
        }
        onLinkClick={(_event, href) => setLastHref(href)}
      />
      {lastHref && (
        <p className="demo-note">
          last clicked: <code>{lastHref}</code>
        </p>
      )}
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main>
      <h1>sourcedown demo</h1>
      <StaticDemo />
      <StreamingDemo />
      <LinkDemo />
    </main>
  </StrictMode>
);
