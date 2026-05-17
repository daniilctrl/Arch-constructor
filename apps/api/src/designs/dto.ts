import { z } from "zod";
import { InputSchema } from "@arch/core";

const Name = z.string().min(1).max(200);

export const CreateDesignSchema = z
  .object({
    name: Name.optional(),
    input: InputSchema,
  })
  .strict();
export type CreateDesignDto = z.infer<typeof CreateDesignSchema>;

export const UpdateDesignSchema = z
  .object({
    name: Name.nullable().optional(),
    input: InputSchema.optional(),
  })
  .strict()
  .refine((v) => v.name !== undefined || v.input !== undefined, {
    message: "At least one field (name or input) must be provided",
  });
export type UpdateDesignDto = z.infer<typeof UpdateDesignSchema>;

export const ForkDesignSchema = z
  .object({
    name: Name.optional(),
  })
  .strict();
export type ForkDesignDto = z.infer<typeof ForkDesignSchema>;
