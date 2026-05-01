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

export function App() {
  return (
    <main className="site-shell">
      <header className="site-nav" aria-label="Site navigation">
        <a className="brand" href="#top">
          Sourcedown
        </a>
        <nav>
          <a href="#docs">Docs</a>
          <a href="#features">Features</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Source-as-Is Renderer</p>
          <h1>Source-Mode Markdown for Streaming AI Output</h1>
          <p className="hero-subtitle">
            Keep every markdown character visible and copyable, while
            headings, links, code, and lists still read like rendered markdown
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#docs">
              Read the docs
            </a>
            <a className="secondary-action" href="#why-source-mode">
              Why source mode
            </a>
          </div>
        </div>

        <AutoplayDemo className="autoplay-demo--hero" />
      </section>

      <section className="rationale" aria-labelledby="why-source-mode">
        <p className="eyebrow">Why Source Mode</p>
        <h2 id="why-source-mode">Why Source Mode Markdown</h2>
        <p>
          WYSIWYG renderers hide syntax, so markdown-literate users lose sight
          of what was generated and what will copy. Plain markdown source is
          trustworthy, but noisy. Sourcedown keeps the source as the document
          and adds just enough semantic styling to make streamed output
          comfortable to read.
        </p>
      </section>

      <section className="feature-grid" id="features" aria-label="Features">
        <article>
          <h3>Source-as-Is</h3>
          <p>Syntax stays visible, selectable, and copyable as raw markdown.</p>
        </article>
        <article>
          <h3>Streaming First</h3>
          <p>Append-only updates go into the CodeMirror buffer incrementally.</p>
        </article>
        <article>
          <h3>Clickable Links</h3>
          <p>Full markdown link ranges can open links without replacing text.</p>
        </article>
        <article>
          <h3>CM6 Highlighting</h3>
          <p>Common fenced code languages get native CodeMirror highlighting.</p>
        </article>
      </section>

      {/* ── docs ───────────────────────────────────────────────────── */}

      <section className="compact-section" id="docs">
        <p className="eyebrow">Get Started</p>
        <h2>Install</h2>
        <pre>
          <code>{`npm install sourcedown
# or
bun add sourcedown`}</code>
        </pre>

        <h2 className="docs-h2">Basic Usage</h2>
        <pre>
          <code>{`import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

export function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}`}</code>
        </pre>

        <h2 className="docs-h2">Streaming</h2>
        <p className="docs-p">
          Pass the growing markdown string as the <code>markdown</code> prop.
          Append-only updates use incremental CodeMirror transactions — no full
          re-render.
        </p>
        <pre>
          <code>{`const [markdown, setMarkdown] = useState("");

useEffect(() => {
  const stream = startAIStream();
  stream.on("chunk", (chunk: string) => {
    setMarkdown((prev) => prev + chunk);
  });
  return () => stream.cancel();
}, []);

return <Sourcedown markdown={markdown} />;`}</code>
        </pre>

        <h2 className="docs-h2">Custom Link Handler</h2>
        <pre>
          <code>{`<Sourcedown
  markdown={markdown}
  onLinkClick={(event, href) => {
    event.preventDefault();
    navigate(href);
  }}
/>`}</code>
        </pre>
        <p className="docs-p">
          Default behavior: opens href in a new tab.
        </p>
      </section>

      <section className="compact-section" id="api">
        <p className="eyebrow">API</p>
        <h2>Props</h2>
        <table className="docs-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>markdown</code></td>
              <td><code>string</code></td>
              <td>—</td>
              <td>Markdown source string</td>
            </tr>
            <tr>
              <td><code>className</code></td>
              <td><code>string</code></td>
              <td><code>undefined</code></td>
              <td>Extra class on the root element</td>
            </tr>
            <tr>
              <td><code>autoScroll</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Pin to bottom while streaming when already at bottom</td>
            </tr>
            <tr>
              <td><code>onLinkClick</code></td>
              <td><code>{"(e, href) => void"}</code></td>
              <td><code>undefined</code></td>
              <td>Called on link click; default opens in new tab</td>
            </tr>
          </tbody>
        </table>

        <h2 className="docs-h2">Supported Syntax</h2>
        <p className="docs-p">
          All markers stay visible. Semantic styling is applied on top.
        </p>
        <table className="docs-table">
          <thead>
            <tr>
              <th>Syntax</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Headings", "# H1 through ###### H6"],
              ["Bold", "**bold**"],
              ["Italic", "_italic_"],
              ["Inline code", "`code`"],
              ["Fenced code", "```ts"],
              ["Links", "[text](url)"],
              ["Blockquotes", "> quote"],
              ["Lists", "- item / 1. item"],
              ["Horizontal rules", "---"],
            ].map(([syntax, example]) => (
              <tr key={syntax}>
                <td>{syntax}</td>
                <td><code>{example}</code></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="docs-h2">Code Highlighting Languages</h2>
        <p className="docs-p">
          CM6-native highlighting for:{" "}
          <code>js</code> / <code>ts</code> / <code>tsx</code> /{" "}
          <code>jsx</code> / <code>json</code> / <code>css</code> /{" "}
          <code>html</code> / <code>bash</code> / <code>markdown</code>.
          Unknown languages fall back to plaintext.
        </p>

        <h2 className="docs-h2">Theming</h2>
        <p className="docs-p">
          Override CSS variables on <code>.sourcedown</code>:
        </p>
        <pre>
          <code>{`.sourcedown {
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
}`}</code>
        </pre>
      </section>

      {/* ── roadmap ────────────────────────────────────────────────── */}

      <section className="compact-section" id="roadmap">
        <p className="eyebrow">Roadmap</p>
        <h2>What&rsquo;s Next</h2>
        <p className="docs-p">
          Version 1 ships a read-only renderer. Planned for later versions:
        </p>
        <ul className="docs-list">
          <li>
            <strong>Editable prompt input</strong> — <code>{"<SourcedownInput />"}</code>{" "}
            with IME, undo/redo, and placeholder
          </li>
          <li>
            <strong>Shiki highlighting</strong> — richer themes, VS Code-style
            colors, streaming tokenizer
          </li>
          <li>
            <strong>shadcn registry</strong> — copy-paste component for shadcn
            projects
          </li>
          <li>
            <strong>Table styling</strong> — pipe table visual rendering with
            source intact
          </li>
          <li>
            <strong>Block widgets</strong> — optional Mermaid / math / image
            previews that append below source
          </li>
        </ul>
        <p className="docs-p docs-p--muted">
          SSR fallback, multi-framework support, and server-rendered docs are
          also deferred.
        </p>
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
