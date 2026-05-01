# sourcedown site source-mode dogfood prototype PRD

## Problem Statement

The current sourcedown website explains source-mode markdown, but the page itself still behaves like a normal product site. Code examples in the docs are plain HTML `<pre><code>` blocks, so they do not show sourcedown's own code highlighting. Headings and code fences also do not demonstrate the core source-mode idea outside the autoplay demo.

NK wants to test whether the entire site can feel more like source-mode markdown: headings visibly include `#`, code blocks visibly include ``` fences, and code examples are highlighted. The risk is that a full source-mode treatment could make the interface look worse or feel gimmicky, so this should be validated locally before any production deployment.

## Solution

Build a local-only prototype of the sourcedown site that dogfoods sourcedown for the main page content.

The site chrome remains normal HTML: navigation, layout shell, GitHub icon, and the hero/demo placement stay controlled by React/CSS. The main content sections become markdown documents rendered with `<Sourcedown />`. This includes the hero copy, why-source-mode explanation, features, install/docs snippets, API reference, supported syntax, theming, and roadmap.

Each major section should use its own `<Sourcedown />` instance rather than one massive page-level document. This keeps the product site layout controllable while still making the content itself source-mode markdown.

Features should move away from card-heavy presentation into markdown lists. API and syntax references should use markdown tables. Code snippets should use fenced code blocks so the visible source includes ``` and CM6-native code highlighting is exercised.

This PRD only covers local development and preview. Do not deploy to Vercel or republish npm as part of this work.

## User Stories

1. As NK reviewing the site, I want to compare a source-mode-like site locally, so that I can decide whether the taste is good before it goes live.
2. As a developer landing on sourcedown, I want the page itself to demonstrate source-mode markdown, so that the product idea is visible immediately.
3. As a markdown-literate developer, I want headings to visibly include `#`, so that the site reinforces the source-as-is mental model.
4. As a developer reading examples, I want code blocks to visibly include ``` fences, so that I can see that sourcedown preserves markdown structure.
5. As a developer evaluating code readability, I want fenced code examples to have CM6-native highlighting, so that the site demonstrates the current v1 code highlighting behavior.
6. As a developer evaluating the package, I want install and usage snippets to remain easy to read, so that source-mode styling does not make docs harder to scan.
7. As a developer comparing features, I want feature content to feel like markdown documentation, so that the page feels coherent with the product.
8. As a developer scanning API details, I want props and syntax references to remain structured, so that moving to markdown tables does not lose clarity.
9. As a future maintainer, I want the dogfood content separated from site chrome, so that layout can stay polished while content dogfoods sourcedown.
10. As a reviewer, I want the prototype to stay local-only, so that production remains stable until the visual direction is approved.

## Implementation Decisions

- Use the existing sourcedown renderer for the site content instead of adding a new markdown renderer.
- Keep nav, GitHub link, page shell, and high-level layout as HTML/React.
- Render each major content section as a separate sourcedown markdown document.
- Convert feature cards into markdown list content.
- Convert API and syntax references into markdown tables.
- Convert docs examples into fenced markdown code blocks.
- Use existing CM6-native code highlighting only. Do not add shiki in this PRD.
- Preserve the existing autoplay streaming demo in the hero.
- Keep the work local-only. Do not push/deploy the prototype until NK reviews it.
- Treat this as a taste prototype first, not a final production migration.

## Testing Decisions

- Tests should verify visible product behavior rather than internal component structure.
- Site tests should confirm that main content is rendered through sourcedown by checking for source-mode text such as `#`, fenced code markers, and markdown tables in the rendered editor text.
- Site tests should confirm code highlighting is exercised for fenced code examples.
- Existing renderer tests remain the safety net for source-as-is behavior, streaming behavior, links, and highlighting.
- Build validation should include the normal test/typecheck/build pipeline.
- Visual validation should happen through the local Vite dev server before any deploy.

## Out of Scope

- Deploying the prototype to Vercel.
- Publishing a new npm version.
- Adding shiki.
- Adding a playground or editable input.
- Rewriting the package renderer.
- Turning nav, buttons, or GitHub icon into markdown-rendered content.
- Keeping the abandoned visual-only C prototype path.

## Further Notes

The key design tension is taste: a site that dogfoods sourcedown can make the product instantly legible, but too much literal source-mode styling may reduce polish. This PRD intentionally keeps the experiment local and keeps layout chrome in HTML so the team can judge the visual result before committing to production.
