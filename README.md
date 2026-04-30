# sourcedown

source-mode markdown renderer for AI streaming output

```tsx
import { Sourcedown } from "sourcedown";
import "sourcedown/style.css";

export function Message({ markdown }: { markdown: string }) {
  return <Sourcedown markdown={markdown} />;
}
```

## v1 scope

- React client component
- read-only CodeMirror 6 renderer
- raw markdown source stays visible
- copy returns raw markdown
- append-only markdown updates are applied incrementally

## non-goals

- editable prompt input
- SSR fallback
- shiki highlighting
- shadcn registry wrapper
- mermaid/math/image preview widgets
