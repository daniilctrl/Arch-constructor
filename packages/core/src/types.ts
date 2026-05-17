import type { Input } from "./input.js";

export type ComponentKind =
  | "service"
  | "database"
  | "cache"
  | "queue"
  | "gateway"
  | "storage"
  | "search"
  | "cdn"
  | "worker"
  | "stream";

export type Component = {
  id: string;
  kind: ComponentKind;
  tech: string;
  reason: string[]; // rule ids
};

export type Protocol = "sync" | "async" | "stream";

export type Edge = {
  from: string;
  to: string;
  protocol: Protocol;
};

export type ADR = {
  ruleId: string;
  title: string;
  rationale: string;
};

export type ArchitectureStyle = "monolith" | "modular_monolith" | "microservices";

export type Architecture = {
  style: ArchitectureStyle;
  components: Component[];
  edges: Edge[];
  decisions: ADR[];
  warnings: string[];
};

export type Rule = {
  id: string;
  title: string;
  when: (input: Input, arch: Architecture) => boolean;
  apply: (input: Input, arch: Architecture) => void;
};
