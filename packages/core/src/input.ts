import { z } from "zod";

export const RPS = z.enum(["low", "medium", "high", "very_high"]);
export const DataVolume = z.enum(["small", "medium", "large"]);
export const Growth = z.enum(["stable", "growing", "viral"]);

export const DataShape = z.enum([
  "relational",
  "document",
  "key_value",
  "graph",
  "timeseries",
  "mixed",
]);

export const Consistency = z.enum(["strong", "eventual", "mixed"]);
export const ReadWriteRatio = z.enum(["read_heavy", "balanced", "write_heavy"]);
export const SearchKind = z.enum(["none", "basic", "fulltext"]);

export const TeamSize = z.enum(["solo", "small", "medium", "large"]);
export const TeamExperience = z.enum(["junior", "mixed", "senior"]);
export const Deployment = z.enum(["on_prem", "cloud", "hybrid"]);
export const Budget = z.enum(["tight", "normal", "generous"]);
export const Compliance = z.enum(["gdpr", "hipaa", "pci", "none"]);

export const InputSchema = z
  .object({
    rps: RPS,
    dataVolume: DataVolume,
    growth: Growth,

    dataShape: DataShape,
    consistency: Consistency,
    readWriteRatio: ReadWriteRatio,

    realtime: z.boolean(),
    longRunningJobs: z.boolean(),
    fileStorage: z.boolean(),
    search: SearchKind,
    analytics: z.boolean(),

    teamSize: TeamSize,
    teamExperience: TeamExperience,
    deployment: Deployment,
    budget: Budget,
    latencyCritical: z.boolean(),
    compliance: z.array(Compliance).min(1),
  })
  .strict();

export type Input = z.infer<typeof InputSchema>;
