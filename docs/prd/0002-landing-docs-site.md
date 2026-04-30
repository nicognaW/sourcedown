# sourcedown landing + docs site PRD

## Problem Statement

sourcedown v1 has a working renderer and README, but it does not yet have a product-facing site that explains the core idea quickly.

Users need to understand why sourcedown exists: it is not a normal markdown renderer. It keeps markdown source visible and copyable while still making streamed AI output readable.

The site should help a developer decide whether sourcedown fits their AI UI and quickly find install, API, examples, theming, and roadmap information.

## Solution

Build a single-page landing and docs site in the existing demo app.

The page follows the streamdown.ai pattern:

- product-first hero
- concise "why source mode markdown" explanation
- docs/get-started as the main CTA path
- concise feature sections
- autoplay streaming demo
- compact docs snippets
- short roadmap/non-goals section

The visual style should be Vercel-like and specifically reference streamdown.ai: restrained, clean, docs/product oriented, with crisp typography and minimal ornament.

The site should not become a long multi-page docs app in v1. It should give enough context to install and evaluate sourcedown, then keep the rest compact.

## User Stories

1. As a developer building an AI chat UI, I want to understand sourcedown in one screen, so that I can decide whether it solves my markdown streaming problem.
2. As a developer who knows markdown, I want to see that sourcedown keeps syntax visible, so that I can trust copy and selection behavior.
3. As a developer comparing sourcedown to streamdown/react-markdown, I want the site to clearly explain source mode markdown, so that I understand the difference.
4. As a developer evaluating streaming behavior, I want an autoplay demo, so that I can see markdown arrive incrementally without needing to interact.
5. As a developer evaluating readability, I want the demo to include headings, bold, links, lists, quotes, and code, so that I can see semantic styling across common syntax.
6. As a developer evaluating links, I want the site to mention clickable source links, so that I understand link behavior does not require hiding markdown syntax.
7. As a developer evaluating installation, I want a get-started snippet, so that I can copy the install/import path quickly.
8. As a developer integrating sourcedown, I want the props/API summarized, so that I know which options are stable in v1.
9. As a developer customizing sourcedown, I want theming variables summarized, so that I can adapt the renderer to my app.
10. As a developer checking scope, I want non-goals and roadmap called out, so that I do not expect input, shiki, shadcn registry, or playground behavior in v1.
11. As NK reviewing the project, I want the site to stay single-page, so that agents can ship it cleanly without overcomplicating the docs architecture.
12. As a future contributor, I want the site structure to be easy to extend later, so that multi-page docs or a playground can be added when sourcedown input exists.
13. As a markdown-literate developer, I want the site to explain why source mode markdown is useful, so that I understand the trust/readability trade-off.

## Implementation Decisions

- Build the site by upgrading the existing demo app instead of creating a separate site package.
- Keep the site single-page with anchor navigation.
- Use the confirmed headline: "source-mode markdown for streaming AI output".
- Use the confirmed subtitle: "keep every markdown character visible and copyable, while headings, links, code, and lists still read like rendered markdown".
- Main navigation should be concise: Docs, Features, Demo, Roadmap. A GitHub link may be present only if a real public URL exists.
- Main CTA follows the streamdown pattern and points toward docs/get-started, not a premature external package/repo campaign.
- Include a short landing section explaining why source mode markdown exists: WYSIWYG renderers hide markdown syntax and can feel unsafe; plain markdown source is trustworthy but visually noisy; sourcedown keeps the source visible while making it readable.
- Live demo is autoplay-only in v1. Do not include a playground, textarea, sample picker, or user input UI.
- Feature grid focuses on four core points: source-as-is, streaming, clickable links, and CM6-native highlighting.
- Docs content mirrors README scope: install, usage, streaming, link handling, props/API, supported syntax, code highlighting languages, theming variables, non-goals, and roadmap.
- Keep post-feature content compact. Do not turn the page into a long docs dump.
- Preserve the current package demo behaviors while replacing the demo presentation with product-site structure.
- Coordinate implementation so one owner can build layout/demo behavior while another owner fills docs content.

## Testing Decisions

- Tests should verify user-visible behavior, not internal layout implementation.
- Existing renderer tests remain the safety net for source-as-is, streaming, links, and highlighting.
- Site tests should cover:
  - headline and core sections render
  - autoplay demo streams text into the sourcedown renderer
  - docs anchors/sections exist for install, API, theming, and roadmap
  - link handling in the demo does not navigate unexpectedly during tests
- Visual quality should be checked by running the Vite demo locally and inspecting desktop/mobile sizes.
- Full build should remain clean after the site rewrite.

## Out of Scope

- Multi-page docs app.
- Search or Cmd+K.
- Playground/input UI.
- Real AI backend integration.
- Editable sourcedown input.
- Shiki demo beyond roadmap mention.
- shadcn registry wrapper.
- Mermaid/math/image widget demos.
- Publishing/deployment automation unless separately requested.

## Further Notes

This PRD keeps the site close to streamdown.ai in content rhythm: hero, features, get started, showcase/demo, and final docs/CTA.

The key difference is product positioning. streamdown is a fully loaded markdown renderer; sourcedown is a source-mode markdown renderer. The site should keep that distinction visible everywhere.
