# dev5 Handoff — sourcedown

**For:** continuing the development of this project  
**Date:** 2026-05-11  
**Last commit:** `93234f6` (v0.2.0)

## What I owned

I was a dev IC on the sourcedown project alongside @dev2. My slices:

- **Slice 3** — semantic markdown styling (`markdownDecorations.ts`, decorations for bold/italic/code/link/heading)
- **Slice 5** — clickable links (`linkClick.ts`, `onLinkClick` prop wiring, CM6 ViewPlugin)
- **Slice 7** — docs, examples, roadmap
- **Task #40** — code block card via `Decoration.line()` (each `cm-line` in FencedCode gets `sd-code-line` class)
- **Task #41** — code block style matching streamdown taste (oklch tokens, border, padding)
- Site slices #12, #13, #15, #18, #19, #20, #24, #25, #29, #30

## Current state

- **v0.2.0 shipped** — npm published, Vercel deployed at https://sourcedown.vercel.app, GitHub public
- **72 tests passing** (mix of markdownDecorations.test.tsx and Sourcedown.test.tsx)
- All tasks on the #sourcedown board are `done`

## Key files

| File | Purpose |
|---|---|
| `src/markdownDecorations.ts` | Core decoration engine — lezer tree walk, all styling logic |
| `src/markdownDecorations.test.tsx` | 60+ unit tests for decorations |
| `src/Sourcedown.tsx` | React component, CM6 state, extension wiring |
| `src/linkClick.ts` | Click-to-open-link CM6 extension |
| `src/codeHighlight.ts` | CM6 syntax highlighting for fenced code blocks |
| `src/theme.ts` | CSS vars and `EditorView.baseTheme` |
| `src/style.css` | Additional CSS (imported by consumers) |
| `demo/` | Dev server demo app |
| `demo/site/` | Landing page + docs site (Vite, dogfood sourcedown) |

## Architecture invariants

1. **Source-as-is**: copy from the editor always returns raw markdown. Never use `Decoration.replace` or widget decorations that hide source characters.
2. **CM6 StateField** holds all decoration state (required for multi-line ranges).
3. **`Decoration.set(marks, true)`** — pass `true` to auto-sort by `from`+`startSide`. Line decs (`startSide=-1`) must precede marks at the same position.
4. **GFM extension** (`lang-markdown` with `GFM`) is enabled in `Sourcedown.tsx`.

## Known tech debt

- `markdownCopyExtension` in `Sourcedown.tsx` may be dead code — widget approach was abandoned, consider removing.
- `collectInlineCodeRanges()` in `markdownDecorations.ts` uses manual DFS; could use `cursor().iterate()`.
- `linkClick.ts`: no URL scheme allowlist (e.g., `javascript:` not blocked). Low risk for now.
- Table column alignment uses `ch` widths + inline-block; CJK-aware via `displayWidth()`. Works but no smart-avoidance for title overlap.

## Suggested next work

See docs/prd/ for full specs. Likely next cycle items:
- **Table cell markdown rendering** (inline bold/italic inside cells) — noted as vNext in CONTEXT
- **Smarter title spacing** (d3-labeler or similar)
- **v0.3 PRD** — run `grill-with-docs` against current codebase before writing

## Suggested skills for next session

- `/tdd` — all new features should follow red→green→refactor, one test per commit
- `/grill-with-docs` — before any new PRD or design decision
- `/to-prd` — after grill to formalize the spec
- `/review` — before merging any cycle

## Repo

`/Users/nk/dev/src/sourcedown` — bun workspace, `bun test` runs all tests, `bun run dev` starts demo server
