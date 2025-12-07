import { z } from "zod";

import { type ButtonConfig } from "../types";

/**
 * Type assertion for Zod v4 recursive schema constraints
 *
 * Background:
 * - Zod v3: `class ZodType<Output, Def extends ZodTypeDef, Input>`
 * - Zod v4: `class ZodType<Output, Input>` (ZodTypeDef parameter removed)
 * - z.lazy() recursive type inference is incomplete, requiring `as unknown as` double assertion
 *
 * References:
 * - Zod v4 Migration Guide: https://zod.dev/v4/changelog
 * - Breaking Changes: https://docs.codemod.com/guides/migrations/zod-3-4
 *
 * Impact:
 * - Same type assertion required for React Hook Form zodResolver integration (see command-form.tsx)
 */
const buttonConfigSchema = z.lazy(() =>
  z.object({
    color: z.string().optional(),
    command: z.string().optional(),
    executeAll: z.boolean().optional(),
    group: z.array(buttonConfigSchema).optional(),
    id: z.string(),
    insertOnly: z.boolean().optional(),
    name: z.string().min(1, "Command name is required"),
    shortcut: z.string().optional(),
    terminalName: z.string().optional(),
    useVsCodeApi: z.boolean().optional(),
  })
) as unknown as z.ZodType<ButtonConfig>;

export const createCommandFormSchema = (): z.ZodType<ButtonConfig> => {
  return z.object({
    color: z.string().optional(),
    command: z.string().optional(),
    executeAll: z.boolean().optional(),
    group: z.array(buttonConfigSchema).optional(),
    id: z.string(),
    insertOnly: z.boolean().optional(),
    name: z.string().min(1, "Command name is required"),
    shortcut: z.string().optional(),
    terminalName: z.string().optional(),
    useVsCodeApi: z.boolean().optional(),
  }) as unknown as z.ZodType<ButtonConfig>;
};

export type CommandFormData = z.infer<ReturnType<typeof createCommandFormSchema>>;
