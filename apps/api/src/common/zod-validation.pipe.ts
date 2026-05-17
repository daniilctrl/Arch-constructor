import {
  PipeTransform,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { ZodSchema } from "zod";

/**
 * Used as a per-route body pipe: @Body(new ZodValidationPipe(SomeSchema)).
 * Throws 422 on schema violation — that's our contract for invalid payloads.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new UnprocessableEntityException({
        message: result.error.issues.map((i) => ({
          path: i.path.join("."),
          code: i.code,
          message: i.message,
        })),
      });
    }
    return result.data;
  }
}
