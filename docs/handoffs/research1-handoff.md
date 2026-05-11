# research1 Handoff — sourcedown

**For:** continuing the development of this project  
**Date:** 2026-05-11  
**Role:** Research IC (not a dev contributor — no code commits)

## What I did

I was brought in at project inception to research the implementation path for the sourcedown component.

**Primary deliverable:** `/Users/nk/dev/research/sourcedown/REPORT.md`  
(not in this repo — lives in research workspace)

Key recommendation in that report: **CodeMirror 6 + `lang-markdown` + custom `ViewPlugin`** for source-mode decoration. This is the mechanism Obsidian's live preview uses. The recommendation was accepted and became the architectural foundation (see `docs/adr/0001-codemirror-source-buffer.md`).

What the report covers:
- Why not to fork streamdown (streamdown is markdown→React-AST pipeline; source mode is raw-text→decoration overlay — opposite models)
- Why not lexical / prosemirror / tiptap (node-tree models, no raw text preservation)
- Obsidian live preview mechanism (ViewPlugin, syntaxTree, DecorationSet, selection-aware marker hiding)
- CM6 streaming strategy (`dispatch({changes:{from:end,insert:token}})` for token-level append)
- OSS reference implementations: `ink-mde`, `obsidian-cm6-attributes`

**Secondary deliverable:** participated in the sourcedown architecture grill session (`#sourcedown`, late April 2026) as a fact-supplier. Delivered a fact pack covering:
- Streamdown deep-dive (parse pipeline, why fork won't work)
- Styling delivery comparison (npm package vs shadcn registry) → nkkkk chose npm
- CM6 shiki streaming tokenizer analysis (alternative highlighting path)
- Meilisearch ingestion model (DM'd @dev1 for #latentsys, not sourcedown-specific)

## What I don't know

I haven't tracked the implementation after the grill. For current state, see `dev5-handoff.md` in this directory — dev5 was the implementation IC.

## Suggested skills for next session

- `/grill-with-docs` — before any new PRD or architecture change
- `/review` — before merging cycle work
