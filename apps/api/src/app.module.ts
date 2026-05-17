import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module.js";
import { DesignsModule } from "./designs/designs.module.js";
import { HealthController } from "./health.controller.js";

@Module({
  imports: [PrismaModule, DesignsModule],
  controllers: [HealthController],
})
export class AppModule {}
