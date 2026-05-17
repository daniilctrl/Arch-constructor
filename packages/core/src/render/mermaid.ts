import type { Architecture, Component, ComponentKind, Edge } from "../types.js";

/**
 * Render an Architecture as a Mermaid flowchart.
 * Different ComponentKinds get different node shapes; edge protocols get different arrow styles.
 */
export function renderMermaid(arch: Architecture): string {
  const lines: string[] = ["flowchart LR"];

  for (const c of arch.components) {
    lines.push(`  ${c.id}${shape(c.kind, label(c))}`);
  }

  if (arch.components.length > 0 && arch.edges.length > 0) {
    lines.push("");
  }

  for (const e of arch.edges) {
    lines.push(`  ${e.from} ${arrow(e.protocol)} ${e.to}`);
  }

  return lines.join("\n") + "\n";
}

function label(c: Component): string {
  // Show tech as the primary label; keep id implicit (it's the node identifier).
  return c.tech;
}

function shape(kind: ComponentKind, text: string): string {
  const q = `"${escape(text)}"`;
  switch (kind) {
    case "database":
    case "cache":
    case "storage":
    case "search":
      return `[(${q})]`;
    case "queue":
    case "stream":
      return `>${q}]`;
    case "gateway":
      return `{{${q}}}`;
    case "cdn":
      return `(${q})`;
    case "service":
    case "worker":
    default:
      return `[${q}]`;
  }
}

function arrow(protocol: Edge["protocol"]): string {
  switch (protocol) {
    case "async":
      return "-.->";
    case "stream":
      return "==>";
    case "sync":
    default:
      return "-->";
  }
}

function escape(s: string): string {
  return s.replace(/"/g, '\\"');
}
