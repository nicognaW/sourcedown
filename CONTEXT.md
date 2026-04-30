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
