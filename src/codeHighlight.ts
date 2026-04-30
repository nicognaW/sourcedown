import {
  HighlightStyle,
  type Language,
  syntaxHighlighting,
} from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { tags } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";

function firstInfoWord(info: string): string {
  return info.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? "";
}

export function codeLanguageFor(info: string): Language | null {
  const language = firstInfoWord(info);

  if (language === "js" || language === "javascript") {
    return javascript().language;
  }

  if (language === "jsx") {
    return javascript({ jsx: true }).language;
  }

  if (language === "ts" || language === "typescript") {
    return javascript({ typescript: true }).language;
  }

  if (language === "tsx") {
    return javascript({ jsx: true, typescript: true }).language;
  }

  if (language === "json") {
    return json().language;
  }

  return null;
}

export const codeHighlightExtension = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.keyword, class: "sd-code-keyword" },
    { tag: tags.string, class: "sd-code-string" },
    { tag: tags.propertyName, class: "sd-code-string" },
    { tag: tags.number, class: "sd-code-number" },
    { tag: tags.comment, class: "sd-code-comment" },
    { tag: tags.variableName, class: "sd-code-variable" },
    { tag: tags.definition(tags.variableName), class: "sd-code-definition" },
    { tag: tags.function(tags.variableName), class: "sd-code-function" },
    { tag: tags.operator, class: "sd-code-operator" },
    { tag: tags.punctuation, class: "sd-code-punctuation" },
  ])
);

export const codeHighlightTheme = EditorView.baseTheme({
  ".sd-code-keyword": {
    color: "var(--sd-code-keyword, #cf222e)",
  },
  ".sd-code-string": {
    color: "var(--sd-code-string, #0a3069)",
  },
  ".sd-code-number": {
    color: "var(--sd-code-number, #0550ae)",
  },
  ".sd-code-comment": {
    color: "var(--sd-code-comment, #6e7781)",
    fontStyle: "italic",
  },
  ".sd-code-variable": {
    color: "var(--sd-code-variable, #24292f)",
  },
  ".sd-code-definition": {
    color: "var(--sd-code-definition, #953800)",
  },
  ".sd-code-function": {
    color: "var(--sd-code-function, #8250df)",
  },
  ".sd-code-operator, .sd-code-punctuation": {
    color: "var(--sd-code-punctuation, #57606a)",
  },
});
