import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sourcedown } from "../src";
import "./style.css";

const autoplaySample = `# Sourcedown

**Source-mode markdown** for streaming AI output.

Every markdown character stays visible and copyable — \`**\`, \`#\`, \`[\`, all of it. Semantic styling is applied on top without replacing the source.

- Every marker stays visible and selectable
- [Links](https://example.com) are still clickable
- Copy always returns raw markdown
- Streaming appends incrementally

\`\`\`ts
import { Sourcedown } from "sourcedown";

function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}
\`\`\`

> Streaming is naturally incremental — just append chunks to the prop.

Works with **React 18 / 19**, Zero config. No hidden characters, no replaced syntax.
`;

const autoplayWords = autoplaySample.match(/\S+\s*/g) ?? [];

const heroMarkdown = `# Source-Mode Markdown for Streaming AI Output

Keep every markdown character visible and copyable, while headings, links, code, and lists still read like rendered markdown.
`;

const whySourceModeMarkdown = `# Why Source Mode Markdown

WYSIWYG renderers hide syntax, so markdown-literate users lose sight of what was generated and what will copy. Plain markdown source is trustworthy, but noisy. Sourcedown keeps the source as the document and adds just enough semantic styling to make streamed output comfortable to read.
`;

const fence = "```";

const docsMarkdown = `# Install

${fence}bash
npm install sourcedown
# or
bun add sourcedown
${fence}

## Basic Usage

${fence}tsx
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

export function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}
${fence}

## Streaming

Pass the growing markdown string as the \`markdown\` prop. Append-only updates use incremental CodeMirror transactions — no full re-render.

${fence}tsx
const [markdown, setMarkdown] = useState("");

useEffect(() => {
  const stream = startAIStream();
  stream.on("chunk", (chunk: string) => {
    setMarkdown((prev) => prev + chunk);
  });
  return () => stream.cancel();
}, []);

return <Sourcedown markdown={markdown} />;
${fence}

## Custom Link Handler

${fence}tsx
<Sourcedown
  markdown={markdown}
  onLinkClick={(event, href) => {
    event.preventDefault();
    navigate(href);
  }}
/>
${fence}

Default behavior: opens href in a new tab.

## Theming

Override CSS variables on \`.sourcedown\`:

${fence}css
.sourcedown {
  --sd-foreground: #171717;
  --sd-background: transparent;
  --sd-font-size: 14px;
  --sd-line-height: 1.65;

  --sd-h1-size: 1.875rem;
  --sd-h2-size: 1.5rem;
  --sd-h3-size: 1.25rem;
  --sd-h4-size: 1.125rem;
  --sd-heading-weight: 600;
  --sd-code-font: ui-monospace, monospace;
  --sd-inline-code-bg: rgba(0,0,0,0.06);
  --sd-link-color: oklch(57.61% 0.2508 258.23);
  --sd-link-underline: oklch(57.61% 0.2508 258.23 / 0.4);
  --sd-blockquote-color: #737373;

  /* code syntax */
  --sd-code-keyword: #cf222e;
  --sd-code-string: #0a3069;
  --sd-code-comment: #6e7781;
  --sd-code-function: #8250df;
}
${fence}
`;

const featuresMarkdown = `# Features

- **Source-as-Is** — syntax stays visible, selectable, and copyable as raw markdown.
- **Streaming First** — append-only updates go into the CodeMirror buffer incrementally.
- **Clickable Links** — full markdown link ranges open links without replacing text.
- **CM6 Highlighting** — common fenced code languages get native CodeMirror highlighting.
`;

const apiMarkdown = `# API

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`markdown\` | \`string\` | — | Markdown source string |
| \`className\` | \`string\` | \`undefined\` | Extra class on the root element |
| \`autoScroll\` | \`boolean\` | \`true\` | Pin to bottom while streaming when already at bottom |
| \`onLinkClick\` | \`(event, href) => void\` | \`undefined\` | Called on link click; default opens in new tab |

## Supported Syntax

All markers stay visible. Semantic styling is applied on top.

| Syntax | Example |
| --- | --- |
| Headings | \`# H1\` through \`###### H6\` |
| Bold | \`**bold**\` |
| Italic | \`_italic_\` |
| Inline code | \`code\` |
| Fenced code | three backticks plus a language info string |
| Links | \`[text](url)\` |
| Blockquotes | \`> quote\` |
| Lists | \`- item\` / \`1. item\` |
| Horizontal rules | \`---\` |

## Code Highlighting Languages

CM6-native highlighting for: \`js\` / \`ts\` / \`tsx\` / \`jsx\` / \`json\` / \`css\` / \`html\` / \`bash\` / \`markdown\`.

Unknown languages fall back to plaintext.
`;

const roadmapMarkdown = `# Roadmap

Version 1 ships a read-only renderer. Planned for later versions:

- **Editable prompt input** — \`<SourcedownInput />\` with IME, undo/redo, and placeholder
- **Shiki highlighting** — richer themes, VS Code-style colors, streaming tokenizer
- **shadcn registry** — copy-paste component for shadcn projects
- **Richer table cells** — inline links, emphasis, and nested syntax inside source-aligned tables
- **Block widgets** — optional Mermaid / math / image previews that append below source

SSR fallback, multi-framework support, and server-rendered docs are also deferred.
`;

function AutoplayDemo({ className }: { className?: string }) {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    let index = 0;
    let built = "";
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (index < autoplayWords.length) {
        built += autoplayWords[index++];
        setMarkdown(built);
        timer = setTimeout(tick, 100);
      } else {
        timer = setTimeout(() => {
          index = 0;
          built = "";
          setMarkdown("");
          timer = setTimeout(tick, 100);
        }, 3000);
      }
    };

    timer = setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={["autoplay-demo", className].filter(Boolean).join(" ")}
      role="region"
      aria-label="Autoplay Sourcedown Stream"
    >
      <div className="demo-status" aria-hidden="true">
        Streaming Markdown
      </div>
      <Sourcedown markdown={markdown} />
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.92c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.5-.01 2.84 0 .28.18.6.69.5A10.08 10.08 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function App() {
  return (
    <main className="site-shell">
      <header className="site-nav" aria-label="Site navigation">
        <a className="brand" href="#top">
          Sourcedown
        </a>
        <nav>
          <a href="#docs">Docs</a>
          <a href="#roadmap">Roadmap</a>
          <a
            className="github-link"
            href="https://github.com/nicognaW/sourcedown"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
          >
            <GitHubIcon />
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy" role="region" aria-label="Hero">
          <Sourcedown
            className="site-markdown site-markdown--hero"
            markdown={heroMarkdown}
          />
        </div>

        <AutoplayDemo className="autoplay-demo--hero" />
      </section>

      <section className="rationale" aria-label="Why Source Mode Markdown">
        <Sourcedown className="site-markdown" markdown={whySourceModeMarkdown} />
      </section>

      <section className="compact-section" id="features" aria-label="Features">
        <Sourcedown
          className="site-markdown site-markdown--features"
          markdown={featuresMarkdown}
        />
      </section>

      <section className="compact-section" id="docs" aria-label="Docs">
        <Sourcedown
          className="site-markdown site-markdown--docs"
          markdown={docsMarkdown}
        />
      </section>

      <section className="compact-section" id="api" aria-label="API">
        <Sourcedown
          className="site-markdown site-markdown--api"
          markdown={apiMarkdown}
        />
      </section>

      <section className="compact-section" id="roadmap" aria-label="Roadmap">
        <Sourcedown
          className="site-markdown site-markdown--roadmap"
          markdown={roadmapMarkdown}
        />
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
