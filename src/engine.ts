import type {
  Architecture,
  Component,
  ComponentKind,
  Edge,
  Input,
  Rule,
} from "./types.js";
import { rules } from "./rules.js";

export function emptyArchitecture(): Architecture {
  return {
    style: "monolith",
    components: [],
    edges: [],
    decisions: [],
    warnings: [],
  };
}

export function has(arch: Architecture, kind: ComponentKind): boolean {
  return arch.components.some((c) => c.kind === kind);
}

export function hasTech(arch: Architecture, tech: string): boolean {
  return arch.components.some((c) => c.tech === tech);
}

export function addComponent(
  arch: Architecture,
  ruleId: string,
  comp: Omit<Component, "reason"> & { reason?: string[] },
): Component {
  const existing = arch.components.find((c) => c.id === comp.id);
  if (existing) {
    if (!existing.reason.includes(ruleId)) existing.reason.push(ruleId);
    return existing;
  }
  const created: Component = {
    id: comp.id,
    kind: comp.kind,
    tech: comp.tech,
    reason: comp.reason ?? [ruleId],
  };
  arch.components.push(created);
  return created;
}

export function addEdge(arch: Architecture, edge: Edge): void {
  const dup = arch.edges.some(
    (e) =>
      e.from === edge.from && e.to === edge.to && e.protocol === edge.protocol,
  );
  if (!dup) arch.edges.push(edge);
}

export function addDecision(
  arch: Architecture,
  ruleId: string,
  title: string,
  rationale: string,
): void {
  arch.decisions.push({ ruleId, title, rationale });
}

export function build(input: Input, ruleSet: Rule[] = rules): Architecture {
  const arch = emptyArchitecture();
  // Always present: an API service. Rules layer infrastructure around it.
  addComponent(arch, "R0", {
    id: "api",
    kind: "service",
    tech: "API",
  });

  // Multi-pass until fixed point (rules can react to other rules' output).
  const maxPasses = 5;
  for (let pass = 0; pass < maxPasses; pass++) {
    const before = snapshot(arch);
    for (const rule of ruleSet) {
      if (rule.when(input, arch)) rule.apply(input, arch);
    }
    if (snapshot(arch) === before) break;
  }
  return arch;
}

function snapshot(arch: Architecture): string {
  return JSON.stringify({
    s: arch.style,
    c: arch.components.map((c) => c.id).sort(),
    e: arch.edges.map((e) => `${e.from}->${e.to}:${e.protocol}`).sort(),
    w: arch.warnings.slice().sort(),
  });
}
