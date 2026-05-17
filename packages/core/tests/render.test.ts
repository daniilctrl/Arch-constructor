import { describe, expect, it } from "vitest";
import { build } from "../src/engine.js";
import { renderMarkdown, renderMermaid } from "../src/render/index.js";
import type { Input } from "../src/input.js";

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

describe("renderMermaid", () => {
  it("starts with flowchart LR header", () => {
    const out = renderMermaid(build(base));
    expect(out.split("\n")[0]).toBe("flowchart LR");
  });

  it("renders database with cylinder shape", () => {
    const out = renderMermaid(build(base));
    expect(out).toMatch(/db\[\("PostgreSQL"\)\]/);
  });

  it("renders service with rectangle shape", () => {
    const out = renderMermaid(build(base));
    expect(out).toMatch(/api\["API"\]/);
  });

  it("renders sync edges with --> and async with -.->", () => {
    const arch = build({
      ...base,
      longRunningJobs: true,
    });
    const out = renderMermaid(arch);
    expect(out).toContain("api --> db"); // R1 adds sync edge
    expect(out).toContain("api -.-> mq"); // R5 adds async edge
  });

  it("renders gateway with hexagon shape when realtime", () => {
    const out = renderMermaid(build({ ...base, realtime: true }));
    expect(out).toMatch(/ws\{\{"WebSocket Gateway"\}\}/);
  });

  it("renders nothing surprising for an empty-ish arch", () => {
    // Force an empty input that still passes schema — solo CRUD case.
    const out = renderMermaid(build(base));
    // No async/stream arrows when no queue
    expect(out).not.toContain("-.->");
    expect(out).not.toContain("==>");
  });
});

describe("renderMarkdown", () => {
  it("includes title, style, components, decisions, diagram", () => {
    const arch = build(base);
    const md = renderMarkdown(arch, {
      title: "Test",
      engineVersion: "0.1.0",
    });
    expect(md).toContain("# Test");
    expect(md).toContain("**Style:** monolith");
    expect(md).toContain("**Engine version:** 0.1.0");
    expect(md).toContain("## Components");
    expect(md).toContain("**PostgreSQL** — database");
    expect(md).toContain("## Decisions");
    expect(md).toContain("R1: Primary DB: PostgreSQL");
    expect(md).toContain("## Diagram");
    expect(md).toContain("```mermaid");
    expect(md).toContain("flowchart LR");
    expect(md.trim().endsWith("```")).toBe(true);
  });

  it("omits warnings section when there are none", () => {
    const md = renderMarkdown(build(base));
    expect(md).not.toContain("## Warnings");
  });

  it("includes warnings section when present", () => {
    const md = renderMarkdown(
      build({ ...base, rps: "very_high", teamSize: "solo" }),
    );
    expect(md).toContain("## Warnings");
    expect(md).toContain("W1:");
  });

  it("uses default title when none provided", () => {
    const md = renderMarkdown(build(base));
    expect(md.startsWith("# Architecture")).toBe(true);
  });
});
