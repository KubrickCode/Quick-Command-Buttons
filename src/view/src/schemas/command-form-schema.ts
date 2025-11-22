import { z } from "zod";

import { type ButtonConfig } from "../types";

export const createCommandFormSchema = (commands: ButtonConfig[], editingIndex?: number) => {
  return z.object({
    color: z.string().optional(),
    command: z.string().optional(),
    executeAll: z.boolean().optional(),
    group: z.array(z.any()).optional(),
    id: z.string(),
    name: z.string().min(1, "Command name is required"),
    shortcut: z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (!value || !value.trim()) return;

        const normalizedShortcut = value.toLowerCase().trim();

        const isDuplicate = commands.some((cmd, index) => {
          if (editingIndex !== undefined && index === editingIndex) {
            return false;
          }
          return cmd.shortcut?.toLowerCase().trim() === normalizedShortcut;
        });

        if (isDuplicate) {
          ctx.addIssue({
            code: "custom",
            message: `Shortcut "${value}" is already used by another command`,
          });
        }
      }),
    terminalName: z.string().optional(),
    useVsCodeApi: z.boolean().optional(),
  });
};

export type CommandFormData = z.infer<ReturnType<typeof createCommandFormSchema>>;
