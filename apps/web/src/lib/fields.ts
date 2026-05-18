// Human-readable labels and descriptions for every Input field.
// Single source of truth — used by InputForm so the UI doesn't speak Kubernetes-manifest.

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

export type ToggleDef = {
  name: string;
  label: string;
  description: string;
};

export const fields = {
  rps: {
    question: "Roughly how busy?",
    options: [
      { value: "low", label: "Quiet — under 100 req/s" },
      { value: "medium", label: "Steady — up to 1k req/s" },
      { value: "high", label: "Busy — up to 10k req/s" },
      { value: "very_high", label: "Slammed — 10k+ req/s" },
    ] satisfies SelectOption[],
  },
  dataVolume: {
    question: "How much data total?",
    options: [
      { value: "small", label: "Small — under 10 GB" },
      { value: "medium", label: "Medium — under 1 TB" },
      { value: "large", label: "Large — more than 1 TB" },
    ] satisfies SelectOption[],
  },
  growth: {
    question: "How fast is it growing?",
    options: [
      { value: "stable", label: "Stable — flat or slow" },
      { value: "growing", label: "Growing — steady upward" },
      { value: "viral", label: "Viral — doubling fast" },
    ] satisfies SelectOption[],
  },
  readWriteRatio: {
    question: "Mostly reads or writes?",
    options: [
      { value: "read_heavy", label: "Mostly reads — browsing, dashboards" },
      { value: "balanced", label: "Balanced" },
      { value: "write_heavy", label: "Mostly writes — ingestion, logging" },
    ] satisfies SelectOption[],
  },
  dataShape: {
    question: "What does your data look like?",
    options: [
      { value: "relational", label: "Relational — tables with joins" },
      { value: "document", label: "Document — flexible JSON-like records" },
      { value: "key_value", label: "Key-value — simple lookups by id" },
      { value: "graph", label: "Graph — relationships are the data" },
      { value: "timeseries", label: "Time-series — measurements over time" },
      { value: "mixed", label: "Mixed — multiple shapes" },
    ] satisfies SelectOption[],
  },
  consistency: {
    question: "How strict about consistency?",
    options: [
      { value: "strong", label: "Strong — same answer for everyone, always" },
      { value: "eventual", label: "Eventual — slight delay is OK" },
      { value: "mixed", label: "Mixed — depends on the operation" },
    ] satisfies SelectOption[],
  },
  search: {
    question: "Need search?",
    options: [
      { value: "none", label: "Not needed" },
      { value: "basic", label: "Basic — by exact fields" },
      { value: "fulltext", label: "Full-text — across long content" },
    ] satisfies SelectOption[],
  },
  teamSize: {
    question: "Team size",
    options: [
      { value: "solo", label: "Solo — just you" },
      { value: "small", label: "Small — 2-5 engineers" },
      { value: "medium", label: "Medium — 6-20 engineers" },
      { value: "large", label: "Large — 20+ engineers" },
    ] satisfies SelectOption[],
  },
  teamExperience: {
    question: "Team experience",
    options: [
      { value: "junior", label: "Mostly junior" },
      { value: "mixed", label: "Mixed" },
      { value: "senior", label: "Mostly senior" },
    ] satisfies SelectOption[],
  },
  deployment: {
    question: "Where will it run?",
    options: [
      { value: "cloud", label: "Public cloud — AWS/GCP/Azure" },
      { value: "on_prem", label: "On-premises" },
      { value: "hybrid", label: "Hybrid" },
    ] satisfies SelectOption[],
  },
  budget: {
    question: "Budget appetite",
    options: [
      { value: "tight", label: "Tight — minimize cost" },
      { value: "normal", label: "Normal" },
      { value: "generous", label: "Generous — performance first" },
    ] satisfies SelectOption[],
  },
};

export const toggles = {
  realtime: {
    name: "input.realtime",
    label: "Real-time updates",
    description: "Live data pushed to users — chat, notifications, live dashboards.",
  },
  longRunningJobs: {
    name: "input.longRunningJobs",
    label: "Long-running jobs",
    description: "Reports, ML training, video processing — things that don't fit in an HTTP request.",
  },
  fileStorage: {
    name: "input.fileStorage",
    label: "File storage",
    description: "User-uploaded images, documents, attachments.",
  },
  analytics: {
    name: "input.analytics",
    label: "Analytics",
    description: "BI dashboards or aggregations over large datasets.",
  },
  latencyCritical: {
    name: "input.latencyCritical",
    label: "Strict latency target",
    description: "Need p99 latency under 100 ms — trading, gaming, live UX.",
  },
} satisfies Record<string, ToggleDef>;

export const complianceOptions: { value: string; label: string; description: string }[] = [
  { value: "none", label: "None", description: "No regulatory constraints." },
  { value: "gdpr", label: "GDPR", description: "EU data privacy — region pinning, soft delete, audit log." },
  { value: "hipaa", label: "HIPAA", description: "US health data — encryption at rest, access controls." },
  { value: "pci", label: "PCI-DSS", description: "Payment cards — strict network and storage isolation." },
];
