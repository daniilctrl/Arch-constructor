import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ENGINE_VERSION, type Input } from "@arch/core";
import { DesignsService } from "../../src/designs/designs.service.js";
import type { PrismaService } from "../../src/prisma/prisma.service.js";

const input: Input = {
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

type MockPrisma = {
  design: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

function makePrisma(): MockPrisma {
  return {
    design: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

function makeDesignRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "fake-id",
    name: null,
    input,
    architecture: { style: "monolith", components: [], edges: [], decisions: [], warnings: [] },
    engineVersion: ENGINE_VERSION,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("DesignsService", () => {
  let prisma: MockPrisma;
  let service: DesignsService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new DesignsService(prisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("builds architecture, writes engineVersion, returns the row", async () => {
      prisma.design.create.mockResolvedValue(makeDesignRow({ id: "new" }));

      const result = await service.create({ input });

      const call = prisma.design.create.mock.calls[0]![0];
      expect(call.data.engineVersion).toBe(ENGINE_VERSION);
      expect(call.data.input).toBe(input);
      // architecture is computed, has at least the api component
      expect(call.data.architecture).toMatchObject({ style: expect.any(String) });
      expect(result.id).toBe("new");
    });

    it("persists name when provided", async () => {
      prisma.design.create.mockResolvedValue(makeDesignRow());
      await service.create({ name: "My design", input });
      expect(prisma.design.create.mock.calls[0]![0].data.name).toBe("My design");
    });
  });

  describe("findOne", () => {
    it("throws NotFound when missing", async () => {
      prisma.design.findUnique.mockResolvedValue(null);
      await expect(service.findOne("nope")).rejects.toBeInstanceOf(NotFoundException);
    });

    it("returns the row when found", async () => {
      prisma.design.findUnique.mockResolvedValue(makeDesignRow({ id: "x" }));
      const r = await service.findOne("x");
      expect(r.id).toBe("x");
    });
  });

  describe("update", () => {
    it("rebuilds architecture when input changes", async () => {
      prisma.design.findUnique.mockResolvedValue(makeDesignRow());
      prisma.design.update.mockResolvedValue(makeDesignRow());

      await service.update("fake-id", { input: { ...input, fileStorage: true } });

      const data = prisma.design.update.mock.calls[0]![0].data;
      expect(data.input).toBeDefined();
      expect(data.architecture).toBeDefined();
      expect(data.engineVersion).toBe(ENGINE_VERSION);
    });

    it("does not rebuild when only name changes", async () => {
      prisma.design.findUnique.mockResolvedValue(makeDesignRow());
      prisma.design.update.mockResolvedValue(makeDesignRow({ name: "X" }));

      await service.update("fake-id", { name: "X" });

      const data = prisma.design.update.mock.calls[0]![0].data;
      expect(data.name).toBe("X");
      expect(data.architecture).toBeUndefined();
      expect(data.engineVersion).toBeUndefined();
    });

    it("propagates NotFound from findOne", async () => {
      prisma.design.findUnique.mockResolvedValue(null);
      await expect(service.update("nope", { name: "X" })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("fork", () => {
    it("creates a new design with parentId set", async () => {
      prisma.design.findUnique.mockResolvedValue(
        makeDesignRow({ id: "parent", name: "Original" }),
      );
      prisma.design.create.mockResolvedValue(
        makeDesignRow({ id: "child", parentId: "parent" }),
      );

      const fork = await service.fork("parent", {});

      const data = prisma.design.create.mock.calls[0]![0].data;
      expect(data.parentId).toBe("parent");
      expect(data.name).toBe("Original (fork)");
      expect(fork.id).toBe("child");
    });

    it("uses provided fork name over default", async () => {
      prisma.design.findUnique.mockResolvedValue(makeDesignRow({ name: "Original" }));
      prisma.design.create.mockResolvedValue(makeDesignRow());
      await service.fork("fake-id", { name: "Variant B" });
      expect(prisma.design.create.mock.calls[0]![0].data.name).toBe("Variant B");
    });
  });

  describe("render", () => {
    it("returns mermaid text/plain", async () => {
      prisma.design.findUnique.mockResolvedValue(makeDesignRow());
      const r = await service.render("fake-id", "mermaid");
      expect(r.contentType).toMatch(/text\/plain/);
      expect(r.body).toContain("flowchart LR");
    });

    it("returns markdown with title from design name", async () => {
      prisma.design.findUnique.mockResolvedValue(
        makeDesignRow({ name: "My App" }),
      );
      const r = await service.render("fake-id", "markdown");
      expect(r.contentType).toMatch(/text\/markdown/);
      expect(r.body.startsWith("# My App")).toBe(true);
    });
  });

  describe("remove", () => {
    it("deletes after verifying existence", async () => {
      prisma.design.findUnique.mockResolvedValue(makeDesignRow({ id: "x" }));
      prisma.design.delete.mockResolvedValue(makeDesignRow({ id: "x" }));
      await service.remove("x");
      expect(prisma.design.delete).toHaveBeenCalledWith({ where: { id: "x" } });
    });
  });
});
