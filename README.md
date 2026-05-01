# sourcedown

source-mode markdown renderer for AI streaming output

renders markdown with all source characters visible — no hidden syntax, no replaced markers. copy always returns the raw markdown.

## install

```sh
npm install sourcedown
```

```sh
bun add sourcedown
```

## usage

```tsx
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

export function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}
```

### streaming

pass the growing markdown string as the `markdown` prop. append-only updates are applied as incremental CodeMirror transactions — no full re-render.

```tsx
import { useEffect, useState } from "react";
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

function StreamingMessage() {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    const stream = startAIStream();
    stream.on("chunk", (chunk: string) => {
      setMarkdown((prev) => prev + chunk);
    });
    return () => stream.cancel();
  }, []);

  return <Sourcedown markdown={markdown} />;
}
```

### custom link handler

```tsx
<Sourcedown
  markdown={markdown}
  onLinkClick={(event, href) => {
    event.preventDefault();
    navigate(href);
  }}
/>
```

by default, links open in a new tab (`window.open(href, "_blank", "noopener,noreferrer")`).

## api

```ts
interface SourcedownProps {
  markdown: string;
  className?: string;
  autoScroll?: boolean;
  onLinkClick?: (event: MouseEvent, href: string) => void;
}
```

| prop | default | description |
| --- | --- | --- |
| `markdown` | — | markdown source string |
| `className` | `undefined` | extra CSS class on the root element |
| `autoScroll` | `true` | scroll to bottom when streaming and already at bottom |
| `onLinkClick` | `undefined` | called on link click; default opens in new tab |

## v1 supported syntax

all of the following render with semantic styling. source characters remain visible in all cases.

| syntax | example |
| --- | --- |
| headings | `# H1` through `###### H6` |
| bold | `**bold**` |
| italic | `_italic_` |
| inline code | `` `code` `` |
| fenced code blocks | ` ```ts ` |
| links | `[text](url)` |
| blockquotes | `> quote` |
| lists | `- item` / `1. item` |
| horizontal rules | `---` |

### code highlighting

fenced code blocks get CM6-native syntax highlighting for:

`js` / `javascript`, `jsx`, `ts` / `typescript`, `tsx`, `json`, `css`, `html`, `bash` / `sh` / `shell` / `zsh`, `md` / `markdown`

unknown languages fall back to plaintext (no highlighting, monospace).

## source-as-is invariant

selecting and copying any range returns the current raw markdown source — no rendered text, no hidden characters.

- `**bold**` copies as `**bold**`
- `# Title` copies as `# Title`
- `[text](url)` copies as `[text](url)`
- code fences copy as raw fenced source

this is enforced by keeping the raw markdown as the CodeMirror document. decorations are applied as styling only, never replacing source characters.

## theming

sourcedown exposes CSS variables for customization. import your own theme by overriding them:

```css
.sourcedown {
  --sd-foreground: #171717;
  --sd-background: transparent;
  --sd-font-family: ui-sans-serif, system-ui, sans-serif;
  --sd-font-size: 14px;
  --sd-line-height: 1.65;
  --sd-selection-background: #b4d5ff;

  /* headings */
  --sd-h1-size: 1.875em;
  --sd-h2-size: 1.5em;
  --sd-h3-size: 1.25em;
  --sd-heading-weight: 600;

  /* code */
  --sd-code-font: ui-monospace, "Cascadia Code", monospace;
  --sd-inline-code-bg: rgba(0, 0, 0, 0.06);

  /* links */
  --sd-link-color: #6366f1;
  --sd-link-underline: rgba(99, 102, 241, 0.4);

  /* blockquotes */
  --sd-blockquote-color: #737373;

  /* code syntax highlighting */
  --sd-code-keyword: #cf222e;
  --sd-code-string: #0a3069;
  --sd-code-tag: #116329;
  --sd-code-attribute: #953800;
  --sd-code-number: #0550ae;
  --sd-code-comment: #6e7781;
  --sd-code-variable: #24292f;
  --sd-code-definition: #953800;
  --sd-code-function: #8250df;
  --sd-code-punctuation: #57606a;
}
```

## not in v1

- editable prompt input (`<SourcedownInput />`) — planned for vNext
- SSR / server-side rendering
- shiki-based code highlighting
- shadcn registry wrapper
- table styling
- mermaid / math / image preview widgets

see [PRD.md](PRD.md) for the full roadmap.

## why not a normal markdown renderer

normal renderers like `streamdown` or `react-markdown` turn markdown into rendered HTML — `**` markers are consumed, headings become `<h1>`, links become `<a>`. the raw source is gone.

sourcedown keeps the source as the document. semantic styling is applied on top without altering the text. this means:

- users see exactly what was generated / what they'll copy
- selection always gives you the real source
- streaming is naturally incremental (append to the buffer, not re-render)
- future editable input can share the same architecture
