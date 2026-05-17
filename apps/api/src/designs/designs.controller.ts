import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { DesignsService } from "./designs.service.js";
import {
  CreateDesignSchema,
  ForkDesignSchema,
  UpdateDesignSchema,
  type CreateDesignDto,
  type ForkDesignDto,
  type UpdateDesignDto,
} from "./dto.js";

@Controller("designs")
export class DesignsController {
  constructor(
    @Inject(DesignsService) private readonly designs: DesignsService,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateDesignSchema)) dto: CreateDesignDto,
  ) {
    return this.designs.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.designs.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateDesignSchema)) dto: UpdateDesignDto,
  ) {
    return this.designs.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string): Promise<void> {
    await this.designs.remove(id);
  }

  @Get(":id/render")
  async render(
    @Param("id") id: string,
    @Query("format") format: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (format !== "mermaid" && format !== "markdown") {
      throw new BadRequestException(
        "Query param 'format' must be 'mermaid' or 'markdown'",
      );
    }
    const { body, contentType } = await this.designs.render(id, format);
    res.setHeader("Content-Type", contentType);
    res.send(body);
  }

  @Post(":id/fork")
  fork(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(ForkDesignSchema)) dto: ForkDesignDto,
  ) {
    return this.designs.fork(id, dto);
  }
}
