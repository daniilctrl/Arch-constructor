import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Design } from "@prisma/client";
import {
  build,
  ENGINE_VERSION,
  renderMarkdown,
  renderMermaid,
  type Architecture,
  type Input,
} from "@arch/core";
import { PrismaService } from "../prisma/prisma.service.js";
import type {
  CreateDesignDto,
  ForkDesignDto,
  UpdateDesignDto,
} from "./dto.js";

@Injectable()
export class DesignsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateDesignDto): Promise<Design> {
    const architecture = build(dto.input);
    return this.prisma.design.create({
      data: {
        name: dto.name ?? null,
        input: dto.input,
        architecture: architecture as unknown as object,
        engineVersion: ENGINE_VERSION,
      },
    });
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.prisma.design.findUnique({ where: { id } });
    if (!design) throw new NotFoundException("Design not found");
    return design;
  }

  async update(id: string, dto: UpdateDesignDto): Promise<Design> {
    const existing = await this.findOne(id);

    const nextInput: Input | undefined = dto.input;
    const rebuild = nextInput !== undefined;
    const architecture: Architecture | undefined = rebuild
      ? build(nextInput!)
      : undefined;

    return this.prisma.design.update({
      where: { id: existing.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(rebuild
          ? {
              input: nextInput!,
              architecture: architecture as unknown as object,
              engineVersion: ENGINE_VERSION,
            }
          : {}),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.findOne(id);
    await this.prisma.design.delete({ where: { id: existing.id } });
  }

  async render(
    id: string,
    format: "mermaid" | "markdown",
  ): Promise<{ body: string; contentType: string }> {
    const design = await this.findOne(id);
    const arch = design.architecture as unknown as Architecture;

    if (format === "mermaid") {
      return { body: renderMermaid(arch), contentType: "text/plain; charset=utf-8" };
    }
    if (format === "markdown") {
      const md = renderMarkdown(arch, {
        title: design.name ?? `Design ${design.id}`,
        engineVersion: design.engineVersion,
      });
      return { body: md, contentType: "text/markdown; charset=utf-8" };
    }
    throw new BadRequestException("format must be 'mermaid' or 'markdown'");
  }

  async fork(id: string, dto: ForkDesignDto): Promise<Design> {
    const parent = await this.findOne(id);
    const input = parent.input as unknown as Input;
    const architecture = build(input);
    return this.prisma.design.create({
      data: {
        name: dto.name ?? (parent.name ? `${parent.name} (fork)` : null),
        input: input as unknown as object,
        architecture: architecture as unknown as object,
        engineVersion: ENGINE_VERSION,
        parentId: parent.id,
      },
    });
  }
}
