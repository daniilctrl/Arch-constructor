export type RPS = "low" | "medium" | "high" | "very_high";
export type DataVolume = "small" | "medium" | "large";
export type Growth = "stable" | "growing" | "viral";

export type DataShape =
  | "relational"
  | "document"
  | "key_value"
  | "graph"
  | "timeseries"
  | "mixed";

export type Consistency = "strong" | "eventual" | "mixed";
export type ReadWriteRatio = "read_heavy" | "balanced" | "write_heavy";
export type SearchKind = "none" | "basic" | "fulltext";

export type TeamSize = "solo" | "small" | "medium" | "large";
export type TeamExperience = "junior" | "mixed" | "senior";
export type Deployment = "on_prem" | "cloud" | "hybrid";
export type Budget = "tight" | "normal" | "generous";
export type Compliance = "gdpr" | "hipaa" | "pci" | "none";

export type Input = {
  rps: RPS;
  dataVolume: DataVolume;
  growth: Growth;

  dataShape: DataShape;
  consistency: Consistency;
  readWriteRatio: ReadWriteRatio;

  realtime: boolean;
  longRunningJobs: boolean;
  fileStorage: boolean;
  search: SearchKind;
  analytics: boolean;

  teamSize: TeamSize;
  teamExperience: TeamExperience;
  deployment: Deployment;
  budget: Budget;
  latencyCritical: boolean;
  compliance: Compliance[];
};

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

export type Architecture = {
  style: "monolith" | "modular_monolith" | "microservices";
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
