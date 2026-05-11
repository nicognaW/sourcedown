# dev2 Handoff - sourcedown

**For:** continuing the development of this project  
**Date:** 2026-05-11  
**Repo:** `/Users/nk/dev/src/sourcedown`  
**Canonical links:** GitHub <https://github.com/nicognaW/sourcedown>, site <https://sourcedown.vercel.app>, npm `sourcedown@0.2.0`

## Current State

- `main` is pushed to GitHub and deployed by Vercel.
- `sourcedown@0.2.0` is published to npm.
- The shipped site dogfoods sourcedown for its main docs/content sections.
- The renderer preserves raw markdown source as the CodeMirror document. This is the core invariant.
- Last known release verification before this handoff: 72 tests passing and build clean, except the existing non-blocking CodeMirror/Vite chunk-size warning.
- Current handoff work is documentation-only.

## What I Owned

- Project lead path from initial research to v0.2 release.
- Initial docs and decisions:
  - `CONTEXT.md`
  - `PRD.md`
  - `docs/adr/0001-codemirror-source-buffer.md`
  - `docs/prd/0002-landing-docs-site.md`
  - `docs/prd/0003-site-source-mode-dogfood-prototype.md`
- Core scaffold:
  - package setup
  - React `<Sourcedown markdown={...} />`
  - CodeMirror read-only source buffer
  - append-vs-replace update behavior
  - demo app shell
- Code highlighting:
  - `src/codeHighlight.ts`
  - language support for JS/TS/TSX/JSON/CSS/HTML/Bash/Markdown
  - fallback for unknown fenced code languages
- Landing/docs site pieces:
  - initial shell/hero
  - autoplay streaming demo
  - source-mode dogfood conversion of site content
  - public GitHub link / simplified anchors / OG image and Twitter card
- Release support:
  - public repo leak audit
  - package metadata review
  - npm smoke-test after v0.1.0
  - v0.2.0 ship checklist coordination
- Table follow-up:
  - reviewed and helped steer away from `Decoration.replace` widgets after copy broke source-as-is
  - finalized source-preserving table behavior and edge cases with inline code / pipes / CJK / empty cells

## Important Files

| Path | Why it matters |
|---|---|
| `src/Sourcedown.tsx` | Public React component and CM6 extension wiring |
| `src/markdownDecorations.ts` | Core markdown source-mode styling and table/code-block layout |
| `src/codeHighlight.ts` | Fenced code language loading and CM6 highlight theme |
| `src/linkClick.ts` | Link click behavior and `onLinkClick` integration |
| `src/theme.ts` / `src/style.css` | Package theme defaults and exported CSS |
| `demo/main.tsx` / `demo/style.css` | Landing site and dogfood docs content |
| `docs/prd/0004-gfm-table-rendering.md` | Accepted source-preserving GFM table direction |
| `docs/prd/0005-gfm-table-widget.md` | Superseded widget attempt; keep as warning/history |
| `README.md` | Public package docs |

## Non-Negotiable Invariants

1. **Source-as-is copy:** selecting text must copy raw markdown, not rendered output.
2. **No hidden syntax in core renderer:** avoid `Decoration.replace` or widgets that hide/replace source characters.
3. **Raw markdown stays in the CM6 document:** decorations only style the source buffer.
4. **Streaming stays controlled by `markdown`:** append-only updates should remain incremental.
5. **Tests should cover user-visible behavior:** especially copied text/source text and rendered classes.

## Known Caveats

- `docs/prd/0005-gfm-table-widget.md` is intentionally superseded. The widget rendered aligned columns but broke copy semantics in real browser behavior.
- Table alignment is source-preserving, not a real HTML table. It uses original text plus width/layout decorations. Do not "fix" it with widgets unless the source-as-is invariant is explicitly changed.
- `README.md` may need a cleanup pass: the old "not in v1" list still mentions table styling even though v0.2.0 added source-preserving table support.
- `linkClick.ts` opens links by default with `noopener,noreferrer`, but there is no URL scheme allowlist yet. Security review called this low risk but worth fixing.
- Vite build has had a non-blocking CodeMirror chunk-size warning. Do not treat it as a release blocker by itself.
- No SSR support, no editable input, no Shiki, no shadcn registry wrapper.

## Suggested Next Work

- README/docs cleanup for v0.2.0 table behavior.
- URL scheme allowlist for default link opening.
- v0.3 planning for editable input (`<SourcedownInput />`) if NK wants to move beyond read-only renderer.
- Richer table-cell inline styling if needed, but keep raw source copy behavior first.
- Optional Shiki/highlight theme exploration after the input/story is stable.

## Suggested Skills

- `grill-with-docs` before changing architecture or scope.
- `to-prd` for any new feature cycle.
- `to-issues` when splitting a PRD into slices.
- `tdd` for implementation.
- `review` / `security-review` before release or npm publish.

## How To Work Here

- Claim work in `#sourcedown` before editing.
- Use `bun run test`, `bun run typecheck`, and `bun run build` for normal validation.
- For a release:
  - bump `package.json`
  - run `npm pack --dry-run`
  - publish requires npm auth / OTP from NK
  - push GitHub; Vercel redeploys automatically
- Keep handoff/status reports short in Slock.
