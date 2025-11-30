import { z } from "zod";
import { ExportFormat } from "../../shared/types";

const buttonConfigSchema: z.ZodType<unknown> = z.lazy(() =>
  z
    .object({
      color: z.string().optional(),
      command: z.string().optional(),
      executeAll: z.boolean().optional(),
      group: z.array(buttonConfigSchema).optional(),
      id: z.string().optional(),
      insertOnly: z.boolean().optional(),
      name: z.string().min(1, { message: "Button name must be a non-empty string" }),
      shortcut: z.string().optional(),
      terminalName: z.string().optional(),
      useVsCodeApi: z.boolean().optional(),
    })
    .refine((data) => data.command !== undefined || data.group !== undefined, {
      message: "Button must have either 'command' or 'group' property",
      path: ["command"],
    })
);

export const exportFormatSchema = z.object({
  buttons: z.array(buttonConfigSchema),
  exportedAt: z.string().datetime({ message: "Invalid ISO 8601 date string" }).optional(),
  version: z.string().optional(),
});

export type ValidatedExportFormat = z.infer<typeof exportFormatSchema>;

export const validateExportFormat = (data: unknown): ExportFormat => {
  return exportFormatSchema.parse(data) as ExportFormat;
};

export const safeValidateExportFormat = (
  data: unknown
): { data?: ExportFormat; error?: string; success: boolean } => {
  const result = exportFormatSchema.safeParse(data);
  if (!result.success) {
    return {
      error: result.error.issues
        .map((e) => `${e.path.join(".") || "base"}: ${e.message}`)
        .join("; "),
      success: false,
    };
  }

  return { data: result.data as ExportFormat, success: true };
};
