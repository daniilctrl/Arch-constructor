import type { Input } from "@arch/core";

export const defaultInput: Input = {
  rps: "low",
  dataVolume: "small",
  growth: "stable",
  dataShape: "relational",
  consistency: "strong",
  readWriteRatio: "balanced",
  realtime: false,
  longRunningJobs: false,
  fileStorage: false,
  search: "none",
  analytics: false,
  teamSize: "solo",
  teamExperience: "mixed",
  deployment: "cloud",
  budget: "normal",
  latencyCritical: false,
  compliance: ["none"],
};
