import "reflect-metadata";
import { execSync } from "node:child_process";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { ENGINE_VERSION, type Input } from "@arch/core";
import { AppModule } from "../../src/app.module.js";
import { PrismaService } from "../../src/prisma/prisma.service.js";

const baseInput: Input = {
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

let app: INestApplication;
let http: ReturnType<typeof request>;
let prisma: PrismaService;

beforeAll(async () => {
  // Apply migrations to the test schema before booting the app.
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });

  app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api");
  await app.init();

  prisma = app.get(PrismaService);
  http = request(app.getHttpServer());
});

afterAll(async () => {
  await prisma.design.deleteMany({});
  await app.close();
});

beforeEach(async () => {
  await prisma.design.deleteMany({});
});

describe("E2E /api/designs", () => {
  it("GET /api/health returns ok", async () => {
    const res = await http.get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("POST /api/designs creates with computed architecture", async () => {
    const res = await http
      .post("/api/designs")
      .send({ name: "Hello", input: baseInput });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.engineVersion).toBe(ENGINE_VERSION);
    expect(res.body.architecture.style).toBe("monolith");
    expect(
      res.body.architecture.components.some(
        (c: { tech: string }) => c.tech === "PostgreSQL",
      ),
    ).toBe(true);
  });

  it("POST rejects malformed input with 422", async () => {
    const res = await http
      .post("/api/designs")
      .send({ input: { rps: "extreme" } });
    expect(res.status).toBe(422);
  });

  it("POST rejects extra fields (strict schema) with 422", async () => {
    const res = await http
      .post("/api/designs")
      .send({ input: baseInput, hacker: true });
    expect(res.status).toBe(422);
  });

  it("GET /api/designs/:id returns 404 when missing", async () => {
    const res = await http.get("/api/designs/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("PATCH with input rebuilds architecture", async () => {
    const created = await http
      .post("/api/designs")
      .send({ input: baseInput });
    const id = created.body.id;

    const updated = await http
      .patch(`/api/designs/${id}`)
      .send({ input: { ...baseInput, fileStorage: true } });

    expect(updated.status).toBe(200);
    const techs = updated.body.architecture.components.map(
      (c: { tech: string }) => c.tech,
    );
    expect(techs).toContain("S3");
  });

  it("PATCH with empty body returns 422", async () => {
    const created = await http
      .post("/api/designs")
      .send({ input: baseInput });
    const res = await http.patch(`/api/designs/${created.body.id}`).send({});
    expect(res.status).toBe(422);
  });

  it("POST /:id/fork sets parentId and keeps input", async () => {
    const parent = await http
      .post("/api/designs")
      .send({ name: "Parent", input: baseInput });
    const fork = await http
      .post(`/api/designs/${parent.body.id}/fork`)
      .send({});

    expect(fork.status).toBe(201);
    expect(fork.body.parentId).toBe(parent.body.id);
    expect(fork.body.name).toBe("Parent (fork)");
  });

  it("DELETE returns 204 then GET returns 404", async () => {
    const created = await http
      .post("/api/designs")
      .send({ input: baseInput });
    const del = await http.delete(`/api/designs/${created.body.id}`);
    expect(del.status).toBe(204);
    const after = await http.get(`/api/designs/${created.body.id}`);
    expect(after.status).toBe(404);
  });

  it("Deleting parent leaves fork with null parentId", async () => {
    const parent = await http
      .post("/api/designs")
      .send({ input: baseInput });
    const fork = await http
      .post(`/api/designs/${parent.body.id}/fork`)
      .send({});

    await http.delete(`/api/designs/${parent.body.id}`);

    const forkAfter = await http.get(`/api/designs/${fork.body.id}`);
    expect(forkAfter.status).toBe(200);
    expect(forkAfter.body.parentId).toBeNull();
  });

  it("GET /:id/render?format=mermaid returns text/plain with flowchart", async () => {
    const created = await http
      .post("/api/designs")
      .send({ input: baseInput });
    const res = await http
      .get(`/api/designs/${created.body.id}/render`)
      .query({ format: "mermaid" });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
    expect(res.text).toContain("flowchart LR");
  });

  it("GET /:id/render?format=markdown returns text/markdown with title", async () => {
    const created = await http
      .post("/api/designs")
      .send({ name: "Title", input: baseInput });
    const res = await http
      .get(`/api/designs/${created.body.id}/render`)
      .query({ format: "markdown" });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/markdown/);
    expect(res.text.startsWith("# Title")).toBe(true);
  });

  it("GET /:id/render with bad format returns 400", async () => {
    const created = await http
      .post("/api/designs")
      .send({ input: baseInput });
    const res = await http
      .get(`/api/designs/${created.body.id}/render`)
      .query({ format: "svg" });
    expect(res.status).toBe(400);
  });
});
