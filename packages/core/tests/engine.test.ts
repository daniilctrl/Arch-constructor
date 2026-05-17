import { describe, expect, it } from "vitest";
import { build } from "../src/engine.js";
import type { Input } from "../src/input.js";
import { InputSchema } from "../src/input.js";

const base: Input = {
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

const techs = (arch: ReturnType<typeof build>) =>
  arch.components.map((c) => c.tech).sort();

describe("scenario: solo dev, small CRUD", () => {
  it("produces a monolith with Postgres only", () => {
    const arch = build(base);
    expect(arch.style).toBe("monolith");
    expect(techs(arch)).toEqual(["API", "PostgreSQL"]);
    expect(arch.warnings).toEqual([]);
  });
});

describe("scenario: read-heavy high-traffic site with file uploads", () => {
  it("adds Redis cache and object storage with CDN", () => {
    const arch = build({
      ...base,
      rps: "high",
      readWriteRatio: "read_heavy",
      fileStorage: true,
    });
    expect(techs(arch)).toContain("Redis");
    expect(techs(arch)).toContain("S3");
    expect(techs(arch)).toContain("CDN");
    // No queue: no long jobs, no realtime
    expect(techs(arch)).not.toContain("RabbitMQ");
    expect(techs(arch)).not.toContain("Kafka");
  });
});

describe("scenario: realtime chat at scale, mid team", () => {
  it("adds WebSocket gateway and RabbitMQ (not Kafka)", () => {
    const arch = build({
      ...base,
      rps: "high",
      readWriteRatio: "read_heavy",
      realtime: true,
      teamSize: "medium",
      growth: "growing",
    });
    expect(techs(arch)).toContain("WebSocket Gateway");
    expect(techs(arch)).toContain("RabbitMQ");
    expect(techs(arch)).not.toContain("Kafka");
  });
});

describe("scenario: very-high RPS triggers microservices", () => {
  it("switches style and adds API gateway", () => {
    const arch = build({
      ...base,
      rps: "very_high",
      teamSize: "medium",
    });
    expect(arch.style).toBe("microservices");
    expect(techs(arch)).toContain("API Gateway");
  });
});

describe("scenario: solo dev forced into microservices", () => {
  it("emits the W1 warning", () => {
    const arch = build({
      ...base,
      rps: "very_high",
      teamSize: "solo",
    });
    expect(arch.style).toBe("microservices");
    expect(arch.warnings.some((w) => w.startsWith("W1:"))).toBe(true);
  });
});

describe("scenario: GDPR in cloud", () => {
  it("emits the W2 warning", () => {
    const arch = build({
      ...base,
      compliance: ["gdpr"],
      deployment: "cloud",
    });
    expect(arch.warnings.some((w) => w.startsWith("W2:"))).toBe(true);
  });

  it("does NOT warn when deployment is on_prem", () => {
    const arch = build({
      ...base,
      compliance: ["gdpr"],
      deployment: "on_prem",
    });
    expect(arch.warnings.some((w) => w.startsWith("W2:"))).toBe(false);
  });
});

describe("scenario: full-text search picks Meilisearch by default", () => {
  it("uses Meilisearch for small/medium teams", () => {
    const arch = build({ ...base, search: "fulltext", teamSize: "small" });
    expect(techs(arch)).toContain("Meilisearch");
    expect(techs(arch)).not.toContain("Elasticsearch");
  });

  it("uses Elasticsearch when team is large", () => {
    const arch = build({ ...base, search: "fulltext", teamSize: "large" });
    expect(techs(arch)).toContain("Elasticsearch");
  });
});

describe("scenario: time-series with analytics", () => {
  it("picks ClickHouse over TimescaleDB", () => {
    const arch = build({
      ...base,
      dataShape: "timeseries",
      analytics: true,
      dataVolume: "medium",
    });
    expect(techs(arch)).toContain("ClickHouse");
    // ETL appears too
    expect(techs(arch)).toContain("ETL");
  });
});

describe("scenario: analytics on small data does not add OLAP", () => {
  it("skips R10 when volume is small", () => {
    const arch = build({ ...base, analytics: true, dataVolume: "small" });
    expect(techs(arch)).not.toContain("ClickHouse");
  });
});

describe("decisions track originating rule", () => {
  it("each added component carries its rule id", () => {
    const arch = build({ ...base, fileStorage: true });
    const objstore = arch.components.find((c) => c.id === "objstore")!;
    expect(objstore.reason).toContain("R7");
    expect(arch.decisions.some((d) => d.ruleId === "R7")).toBe(true);
  });

  it("does not duplicate decisions across multi-pass fixpoint loop", () => {
    const arch = build(base);
    const ids = arch.decisions.map((d) => `${d.ruleId}:${d.title}`);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("InputSchema validates", () => {
  it("accepts a well-formed input", () => {
    expect(InputSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an unknown enum value", () => {
    const bad = { ...base, rps: "extreme" };
    expect(InputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const { rps: _omit, ...partial } = base;
    expect(InputSchema.safeParse(partial).success).toBe(false);
  });

  it("rejects extra fields (strict)", () => {
    expect(
      InputSchema.safeParse({ ...base, sneakyExtra: true }).success,
    ).toBe(false);
  });

  it("rejects empty compliance array", () => {
    expect(InputSchema.safeParse({ ...base, compliance: [] }).success).toBe(
      false,
    );
  });
});
