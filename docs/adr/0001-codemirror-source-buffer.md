# ADR 0001: use CodeMirror 6 as the source buffer

## status

Accepted

## context

sourcedown needs to render markdown in source mode: every original markdown character must stay visible and copyable as raw markdown, while the UI still looks more semantic than plain source text.

The main alternatives were:

- fork streamdown and replace its render layer
- use CodeMirror 6 with `lang-markdown` and custom decorations

streamdown is good at AI streaming markdown rendering, but its core pipeline turns markdown into rendered React output. Markdown markers such as `**`, `#`, link brackets, fences, table pipes, and list markers are consumed or normalized by the markdown AST/render pipeline.

A fork could keep streamdown's block splitting and memoization, then rebuild raw-source spans from positions. That path still has hidden costs:

- reconstructing or slicing markers for links, lists, code fences, tables, and headings
- keeping incomplete streaming blocks aligned with raw source when parsers patch or normalize incomplete input
- ensuring browser copy always returns plain raw markdown, not rich rendered content

CodeMirror 6 keeps the markdown as the primary text buffer. Styling can be added with decorations while copy/selection remain text-buffer based.

## decision

Use CodeMirror 6 for the core renderer:

- `EditorState` stores the raw markdown source
- `@codemirror/lang-markdown` provides markdown parsing
- custom extensions/ViewPlugins add semantic decorations
- append-only streaming updates use `view.dispatch({ changes })`
- copied text remains the current raw markdown source

Do not fork streamdown's render pipeline for v1.

streamdown remains useful as a reference for AI streaming edge cases, packaging style, incomplete markdown test cases, and possible future widgets/components.

## consequences

Positive:

- source-as-is copy behavior is native
- streaming append is incremental
- future editable prompt input can reuse the same core
- long documents benefit from CodeMirror viewport rendering

Negative:

- bundle size is larger than a small custom React renderer
- visual styling must be built as CodeMirror decorations/theme
- rich rendered widgets such as mermaid/math previews are deferred

## follow-ups

- Consider shiki for vNext code highlighting, using the streaming tokenizer pattern found in diffs.
- Consider a shadcn registry wrapper after the npm package is useful.
- Consider `<SourcedownInput />` as a separate editable component after the renderer is stable.
