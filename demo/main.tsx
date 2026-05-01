import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sourcedown } from "../src";
import "./style.css";

const autoplaySample = `# sourcedown

**source-mode markdown** for streaming AI output.

Every markdown character stays visible and copyable — \`**\`, \`#\`, \`[\`, all of it. Semantic styling is applied on top without replacing the source.

- every marker stays visible and selectable
- [links](https://example.com) are still clickable
- copy always returns raw markdown
- streaming appends incrementally

\`\`\`ts
import { Sourcedown } from "sourcedown";

function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}
\`\`\`

> streaming is naturally incremental — just append chunks to the prop.

Works with **React 18 / 19**, zero config. No hidden characters, no replaced syntax.
`;

function AutoplayDemo({ className }: { className?: string }) {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    let index = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      index = Math.min(index + 25, autoplaySample.length);
      setMarkdown(autoplaySample.slice(0, index));
      if (index < autoplaySample.length) {
        timer = setTimeout(tick, 35);
      } else {
        timer = setTimeout(() => {
          index = 0;
          setMarkdown("");
          timer = setTimeout(tick, 35);
        }, 3000);
      }
    };

    timer = setTimeout(tick, 35);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={["autoplay-demo", className].filter(Boolean).join(" ")}
      role="region"
      aria-label="autoplay sourcedown stream"
    >
      <div className="demo-status" aria-hidden="true">
        <span />
        streaming markdown
      </div>
      <Sourcedown markdown={markdown} />
    </div>
  );
}

export function App() {
  return (
    <main className="site-shell">
      <header className="site-nav" aria-label="site navigation">
        <a className="brand" href="#top">
          sourcedown
        </a>
        <nav>
          <a href="#docs">Docs</a>
          <a href="#features">Features</a>
          <a href="#roadmap">Roadmap</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">source-as-is renderer</p>
          <h1>source-mode markdown for streaming AI output</h1>
          <p className="hero-subtitle">
            keep every markdown character visible and copyable, while
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
        <p className="eyebrow">why source mode</p>
        <h2 id="why-source-mode">why source mode markdown</h2>
        <p>
          WYSIWYG renderers hide syntax, so markdown-literate users lose sight
          of what was generated and what will copy. Plain markdown source is
          trustworthy, but noisy. sourcedown keeps the source as the document
          and adds just enough semantic styling to make streamed output
          comfortable to read.
        </p>
      </section>

      <section className="feature-grid" id="features" aria-label="features">
        <article>
          <h3>source-as-is</h3>
          <p>syntax stays visible, selectable, and copyable as raw markdown.</p>
        </article>
        <article>
          <h3>streaming first</h3>
          <p>append-only updates go into the CodeMirror buffer incrementally.</p>
        </article>
        <article>
          <h3>clickable links</h3>
          <p>full markdown link ranges can open links without replacing text.</p>
        </article>
        <article>
          <h3>CM6 highlighting</h3>
          <p>common fenced code languages get native CodeMirror highlighting.</p>
        </article>
      </section>

      {/* ── docs ───────────────────────────────────────────────────── */}

      <section className="compact-section" id="docs">
        <p className="eyebrow">get started</p>
        <h2>install</h2>
        <pre>
          <code>{`npm install sourcedown
# or
bun add sourcedown`}</code>
        </pre>

        <h2 className="docs-h2">basic usage</h2>
        <pre>
          <code>{`import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

export function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}`}</code>
        </pre>

        <h2 className="docs-h2">streaming</h2>
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

        <h2 className="docs-h2">custom link handler</h2>
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
        <p className="eyebrow">api</p>
        <h2>props</h2>
        <table className="docs-table">
          <thead>
            <tr>
              <th>prop</th>
              <th>type</th>
              <th>default</th>
              <th>description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>markdown</code></td>
              <td><code>string</code></td>
              <td>—</td>
              <td>markdown source string</td>
            </tr>
            <tr>
              <td><code>className</code></td>
              <td><code>string</code></td>
              <td><code>undefined</code></td>
              <td>extra class on the root element</td>
            </tr>
            <tr>
              <td><code>autoScroll</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>pin to bottom while streaming when already at bottom</td>
            </tr>
            <tr>
              <td><code>onLinkClick</code></td>
              <td><code>{"(e, href) => void"}</code></td>
              <td><code>undefined</code></td>
              <td>called on link click; default opens in new tab</td>
            </tr>
          </tbody>
        </table>

        <h2 className="docs-h2">supported syntax</h2>
        <p className="docs-p">
          All markers stay visible. Semantic styling is applied on top.
        </p>
        <table className="docs-table">
          <thead>
            <tr>
              <th>syntax</th>
              <th>example</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["headings", "# H1 through ###### H6"],
              ["bold", "**bold**"],
              ["italic", "_italic_"],
              ["inline code", "`code`"],
              ["fenced code", "```ts"],
              ["links", "[text](url)"],
              ["blockquotes", "> quote"],
              ["lists", "- item / 1. item"],
              ["horizontal rules", "---"],
            ].map(([syntax, example]) => (
              <tr key={syntax}>
                <td>{syntax}</td>
                <td><code>{example}</code></td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="docs-h2">code highlighting languages</h2>
        <p className="docs-p">
          CM6-native highlighting for:{" "}
          <code>js</code> / <code>ts</code> / <code>tsx</code> /{" "}
          <code>jsx</code> / <code>json</code> / <code>css</code> /{" "}
          <code>html</code> / <code>bash</code> / <code>markdown</code>.
          Unknown languages fall back to plaintext.
        </p>

        <h2 className="docs-h2">theming</h2>
        <p className="docs-p">
          Override CSS variables on <code>.sourcedown</code>:
        </p>
        <pre>
          <code>{`.sourcedown {
  --sd-foreground: #171717;
  --sd-background: transparent;
  --sd-font-size: 14px;
  --sd-line-height: 1.65;

  --sd-h1-size: 1.5em;
  --sd-heading-weight: 700;
  --sd-code-font: ui-monospace, monospace;
  --sd-inline-code-bg: rgba(0,0,0,0.06);
  --sd-link-color: #0969da;
  --sd-blockquote-color: rgba(0,0,0,0.6);

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
        <p className="eyebrow">roadmap</p>
        <h2>what&rsquo;s next</h2>
        <p className="docs-p">
          v1 ships a read-only renderer. planned for later versions:
        </p>
        <ul className="docs-list">
          <li>
            <strong>editable prompt input</strong> — <code>{"<SourcedownInput />"}</code>{" "}
            with IME, undo/redo, and placeholder
          </li>
          <li>
            <strong>shiki highlighting</strong> — richer themes, vscode-style
            colors, streaming tokenizer
          </li>
          <li>
            <strong>shadcn registry</strong> — copy-paste component for shadcn
            projects
          </li>
          <li>
            <strong>table styling</strong> — pipe table visual rendering with
            source intact
          </li>
          <li>
            <strong>block widgets</strong> — optional mermaid / math / image
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
