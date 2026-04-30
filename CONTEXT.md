# sourcedown context

## glossary

### sourcedown

React markdown rendering component for AI streaming output. The component renders markdown as source text with semantic visual styling.

### source mode markdown

Markdown display mode where every source character remains visible, selectable, and copyable as-is. Rendering is applied as visual styling on top of the source text, not by replacing markdown syntax with HTML-only output.

Examples:

- `# Title` remains `# Title` in the document and copied text, while the whole line can look like a heading.
- `**bold**` remains `**bold**` in the document and copied text, while the full range can look bold.
- `[text](url)` remains `[text](url)` in the document and copied text, while the range can look and behave like a link.

### source-as-is

Invariant that the rendered DOM/editor text and copied plain text must match the current markdown source exactly.

This rules out hiding, replacing, or regenerating markdown markers in the core renderer.

### semantic styling

Visual treatment derived from markdown syntax without changing the underlying text. It includes heading sizing, bold/italic styling, inline-code styling, blockquote/list layout, code-block framing, link styling, and code syntax highlighting.

### streaming renderer

Read-only renderer that receives growing markdown text and updates incrementally. The v1 React API is controlled by a `markdown` prop; internally, append-only updates should be applied as incremental CodeMirror transactions.

### sourcedown input

Future editable prompt-input component using the same source-mode visual model. It is not part of v1, but v1 should avoid architectural choices that block it.

### sourcedown site

Single-page landing and documentation site for sourcedown. It combines product positioning, a live streaming demo, install/API docs, examples, theming reference, and roadmap in one page with anchor navigation.

The site is not the package demo alone. The package demo proves behavior for development; the sourcedown site explains the product and helps users decide whether to install it.

The site should follow the streamdown.ai pattern: product-first hero, docs as the main navigation/CTA path, feature sections, get-started code snippet, and a live demo.

Visual direction is Vercel-style and should specifically reference streamdown.ai: clean docs/product layout, restrained contrast, minimal ornament, crisp typography, and feature blocks around the renderer/demo.

For v1, the live demo is autoplay-only. Do not add a playground or source input UI until sourcedown has an input component.

The v1 site should upgrade the existing `demo/` Vite app instead of introducing a separate `site/` package.

The v1 documentation sections mirror the README scope: install, usage, streaming, link handling, props/API, supported syntax, code highlighting languages, theming variables, non-goals, and roadmap. Do not add search, Cmd+K, or a complex multi-page docs sidebar in v1.

After the feature section, keep content compact in the streamdown.ai style. The site should not become a long docs dump; it should move quickly from features to get-started/docs snippets and final roadmap/CTA.

The v1 landing copy uses this positioning:

- headline: "source-mode markdown for streaming AI output"
- subtitle: "keep every markdown character visible and copyable, while headings, links, code, and lists still read like rendered markdown"

## decisions

- v1 is a React-only client component for modern browsers.
- v1 is a read-only streaming renderer, not an editor.
- v1 must preserve source-as-is copy semantics.
- v1 uses CodeMirror 6 as the text buffer and decoration layer.
- v1 does not fork streamdown's markdown-to-React render pipeline.
- v1 ships as an npm package named `sourcedown`.
- v1 exposes `<Sourcedown markdown={...} />` as the primary API.
- v1 provides default styles and allows class/CSS customization.
- v1 uses CM6-native code highlighting first, while leaving room for shiki later.
- v1 site is a single-page static site with anchor navigation, not a multi-page docs app.
- v1 site should be streamdown-inspired in structure: docs-first CTA, feature sections, get-started snippet, and autoplay live demo.
- v1 site does not include a playground; playground waits for sourcedown input.
- v1 site visual style should be Vercel-like, with streamdown.ai as the concrete style reference.
- v1 site lives in the existing `demo/` app.
- v1 site docs mirror README scope and skip search/Cmd+K/multi-page docs navigation.
- v1 site headline and subtitle use the sourcedown-specific source-mode positioning, not a generic markdown renderer pitch.
- v1 site keeps post-feature content compact, following streamdown.ai's rhythm rather than expanding into a long documentation page.
