import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sourcedown } from "../src";
import "./style.css";

const sample = `# sourcedown

source-mode markdown renderer for AI streaming output

## why

**all markdown source characters stay visible** while the text gets semantic styling.

- raw markdown remains selectable
- copy returns source
- streaming append uses CodeMirror transactions

\`\`\`ts
const markdown = "# hello";
console.log(markdown);
\`\`\`

[open example](https://example.com)
`;

function Demo() {
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 4;
      setMarkdown(sample.slice(0, index));
      if (index >= sample.length) {
        clearInterval(timer);
      }
    }, 35);

    return () => clearInterval(timer);
  }, []);

  return (
    <main>
      <h1>sourcedown demo</h1>
      <section>
        <Sourcedown markdown={markdown} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>
);
