import type { Architecture } from "../types.js";
import { renderMermaid } from "./mermaid.js";

export type MarkdownRenderOptions = {
  title?: string;
  engineVersion?: string;
};

export function renderMarkdown(
  arch: Architecture,
  opts: MarkdownRenderOptions = {},
): string {
  const out: string[] = [];

  out.push(`# ${opts.title ?? "Architecture"}`);
  out.push("");
  out.push(`**Style:** ${arch.style}`);
  if (opts.engineVersion) out.push(`**Engine version:** ${opts.engineVersion}`);
  out.push("");

  out.push("## Components");
  out.push("");
  for (const c of arch.components) {
    const reasons = c.reason.length ? ` _(${c.reason.join(", ")})_` : "";
    out.push(`- **${c.tech}** — ${c.kind}${reasons}`);
  }
  out.push("");

  if (arch.decisions.length > 0) {
    out.push("## Decisions");
    out.push("");
    for (const d of arch.decisions) {
      out.push(`### ${d.ruleId}: ${d.title}`);
      out.push("");
      out.push(d.rationale);
      out.push("");
    }
  }

  if (arch.warnings.length > 0) {
    out.push("## Warnings");
    out.push("");
    for (const w of arch.warnings) {
      out.push(`- ${w}`);
    }
    out.push("");
  }

  out.push("## Diagram");
  out.push("");
  out.push("```mermaid");
  out.push(renderMermaid(arch).trimEnd());
  out.push("```");
  out.push("");

  return out.join("\n");
}
