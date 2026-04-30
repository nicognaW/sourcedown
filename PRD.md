# sourcedown PRD

## summary

sourcedown is a React component that renders markdown in source mode for AI streaming output.

The core experience is:

- all markdown source characters remain visible
- copy returns the raw markdown source exactly
- markdown still looks semantically rendered enough to read comfortably
- streaming output updates incrementally

v1 ships a read-only renderer. Editable prompt input is a planned follow-up, not part of v1.

## problem

Fully WYSIWYG markdown renderers hide markdown syntax. For users who know markdown, this can feel unsafe because the visible output no longer shows the real source being generated or copied.

Plain markdown source is safe but visually noisy.

sourcedown should sit between those modes: source text remains the UI, while semantic styling makes it easier to read.

## goals

- Render markdown source as-is with semantic visual styling.
- Preserve exact raw markdown copy behavior.
- Support AI streaming output efficiently.
- Provide a small React API similar in spirit to streamdown.
- Keep v1 client-side and easy to install as an npm package.
- Choose an architecture that can later support editable prompt input.

## non-goals for v1

- No editable input component.
- No SSR fallback.
- No mermaid/math/image preview widgets.
- No table rendering pass.
- No shadcn registry distribution.
- No shiki-based code highlighting yet.
- No hiding, replacing, or regenerating markdown markers.

## target users

- NK's own AI/chat tooling.
- Developers building AI UIs where markdown is streamed and the source should stay visible.
- Future open-source users who want a source-mode markdown renderer rather than a normal markdown-to-HTML renderer.

## core requirements

### source-as-is invariant

All source characters must remain in the rendered text:

- `#`
- `**`
- `_`
- backticks and code fences
- list markers
- blockquote markers
- link brackets and URL syntax
- horizontal rule characters

Selecting and copying any range should return the current raw markdown text for that range.

### semantic styling

v1 covers:

- headings
- bold
- italic
- inline code
- fenced code blocks
- links
- lists
- blockquotes
- horizontal rules

Markers and content receive the same semantic treatment. For example:

- the full `# Title` range looks like a heading
- the full `**bold**` range looks bold

### links

The full link source range should be styled and clickable:

```md
[text](https://example.com)
```

Click behavior must not break text selection or raw-copy behavior.

### code blocks

v1 should include code-block framing and CM6-native syntax highlighting.

Initial built-in language support:

- JavaScript
- TypeScript
- TSX
- JSON
- CSS
- HTML
- Bash
- Markdown
- plaintext fallback

The API should leave room for later shiki support.

### streaming

The primary React API is controlled:

```tsx
<Sourcedown markdown={markdown} />
```

When the new `markdown` prop is an append-only extension of the previous value, the component should update the CodeMirror document with an incremental transaction.

When the value is not append-only, the component may reset the document.

### auto-scroll

During streaming:

- if the user is already at the bottom, new content should keep the viewport pinned to the bottom
- if the user scrolls up manually, auto-follow should pause
- when the user returns to the bottom, auto-follow should resume

### package and distribution

v1 package name:

```txt
sourcedown
```

Primary import:

```tsx
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";
```

v1 is a React client component for modern browsers, aligned with streamdown's client-first AI UI model.

## proposed API

```ts
export interface SourcedownProps {
  markdown: string;
  className?: string;
  autoScroll?: boolean;
  onLinkClick?: (event: MouseEvent, href: string) => void;
}
```

Defaults:

- `autoScroll: true`
- link click opens the URL in a new tab

Possible future props:

- `codeHighlighter`
- `theme`
- `extensions`
- `onReady`

## technical approach

Use CodeMirror 6:

- `@codemirror/state`
- `@codemirror/view`
- `@codemirror/lang-markdown`
- selected CM6 language packages for code fences

Core pieces:

- React wrapper that owns an `EditorView`
- read-only `EditorState`
- markdown extension
- sourcedown decoration extension
- default theme/style package
- append-only prop diff
- auto-scroll controller

The sourcedown decoration extension traverses the markdown syntax tree and emits `Decoration.mark` ranges. It should not use `Decoration.replace` for v1 source characters.

## why not fork streamdown

streamdown's pipeline is optimized for markdown-to-React rendering. It consumes markdown syntax into an AST/render tree.

sourcedown needs the raw markdown source to be the rendered text. Forking streamdown would require rebuilding source ranges and copy semantics on top of a pipeline that already transformed the source.

CodeMirror's model is closer to the product:

- raw markdown is the primary document
- styling is decoration
- streaming edits are incremental
- copy is naturally raw text
- editable input can be added later

streamdown remains a useful reference for:

- packaging expectations
- AI streaming edge cases
- incomplete markdown test cases
- future widgets/components

## future roadmap

### vNext: sourcedown input

Add an editable prompt-input component:

```tsx
<SourcedownInput value={value} onChange={setValue} />
```

This requires separate product design for:

- IME input
- undo/redo
- placeholder
- submit shortcut
- paste behavior
- height autoresize
- editing while generated content is streaming

### vNext: shiki code highlighting

Add shiki-based code highlighting for richer themes.

Reference: diffs uses a streaming shiki tokenizer with grammar-state carryover and stable/unstable token handling. That pattern is a good fit for later code-fence highlighting.

### vNext: shadcn wrapper

If users want shadcn-style customization, add a registry wrapper later. v1 should not block this, but it should not be delayed by registry work.

### vNext: block previews

Optional source-preserving previews for mermaid/math/images may be added later as appended widgets. They must not replace source text.

## implementation slices

### slice 1: project scaffold

- create `sourcedown` package
- React 18/19 peer deps
- CM6 deps
- build with TypeScript output and bundled CSS
- add basic demo page

### slice 2: read-only CM6 wrapper

- render raw markdown in a read-only `EditorView`
- expose `<Sourcedown markdown={...} />`
- apply default base styling
- preserve selection/copy

### slice 3: markdown semantic decorations

- add markdown syntax-tree traversal
- style headings, bold, italic, inline code, code fences, links, lists, blockquotes, and horizontal rules
- keep all source characters visible

### slice 4: streaming updates

- detect append-only prop updates
- use `view.dispatch({ changes })` for append
- reset on non-append updates
- add tests/demo for character-by-character streaming

### slice 5: auto-scroll

- implement bottom-follow behavior
- pause when user scrolls away
- resume when user returns to bottom

### slice 6a: clickable links

- make link ranges clickable without breaking selection/copy

### slice 6b: code highlighting

- add CM6-native code highlighting for common languages
- add plaintext fallback

### slice 7: docs and polish

- document API and install path
- document source-as-is invariant
- document non-goals and roadmap
- add examples for chat streaming and static markdown

## acceptance criteria

- `**bold**` is displayed with all eight source characters visible and copies as `**bold**`.
- `# Title` is displayed with the `#` visible and copies as `# Title`.
- `[text](url)` is visible as source, clickable, and copies as `[text](url)`.
- Code fences remain visible and copy as raw fenced code.
- Streaming append updates without full React remount.
- Incomplete streaming markdown such as a half-written link or unclosed code fence remains visible and does not crash rendering.
- Auto-scroll follows only when the user is at the bottom.
- All v1 supported markdown syntax stays source-as-is.
- v1 docs clearly state that editing, shiki, shadcn registry, table styling, and block previews are future work.
