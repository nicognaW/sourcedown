import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Sourcedown } from "../src";
import "./style.css";

const heroSample = `# sourcedown

**source-mode markdown** for streaming AI output.

- every marker stays visible
- streaming appends incrementally
- [links](https://example.com) stay clickable

\`\`\`ts
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";
\`\`\`
`;

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
          <a href="#demo">Demo</a>
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
            <a className="secondary-action" href="#demo">
              View demo
            </a>
          </div>
        </div>

        <div className="hero-demo" aria-label="sourcedown preview">
          <Sourcedown markdown={heroSample} />
        </div>
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

      <section className="compact-section" id="docs">
        <p className="eyebrow">get started</p>
        <h2>install and render markdown</h2>
        <pre>
          <code>{`bun add sourcedown

import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

export function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}`}</code>
        </pre>
      </section>

      <section className="compact-section" id="demo">
        <p className="eyebrow">demo</p>
        <h2>autoplay streaming demo</h2>
        <p>coming in the next slice.</p>
      </section>

      <section className="compact-section" id="roadmap">
        <p className="eyebrow">roadmap</p>
        <h2>next up</h2>
        <p>editable input, shiki highlighting, shadcn wrapper, and widgets.</p>
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
