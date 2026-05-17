import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: corsConfig() });
  app.setGlobalPrefix("api");

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}/api`);
}

/**
 * In dev (no WEB_ORIGIN set) — allow everything for convenience.
 * In prod — pin to a comma-separated whitelist via WEB_ORIGIN.
 *   WEB_ORIGIN=https://my-app.vercel.app
 *   WEB_ORIGIN=https://a.com,https://b.com
 */
function corsConfig(): boolean | { origin: string[] | RegExp[] } {
  const raw = process.env.WEB_ORIGIN?.trim();
  if (!raw) return true;
  const origins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { origin: origins };
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
