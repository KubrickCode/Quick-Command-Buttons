import { ButtonConfigWithOptionalId, ValidationError } from "../../shared/types";

export type { ValidationError };

export type ValidationResult = {
  errors: ValidationError[];
  hasErrors: boolean;
};

const hasValidCommand = (button: unknown): boolean => {
  if (typeof button !== "object" || button === null) return false;
  const btn = button as Record<string, unknown>;
  return "command" in btn && typeof btn.command === "string" && btn.command.length > 0;
};

const hasValidGroup = (button: unknown): boolean => {
  if (typeof button !== "object" || button === null) return false;
  const btn = button as Record<string, unknown>;
  return "group" in btn && Array.isArray(btn.group) && btn.group.length > 0;
};

const hasCommandAndGroup = (button: unknown): boolean =>
  hasValidCommand(button) && hasValidGroup(button);

const hasNeitherCommandNorGroup = (button: unknown): boolean =>
  !hasValidCommand(button) && !hasValidGroup(button);

const getRawCommand = (button: ButtonConfigWithOptionalId): string | undefined => {
  const btn = button as Record<string, unknown>;
  return typeof btn.command === "string" ? btn.command : undefined;
};

const getRawGroup = (button: ButtonConfigWithOptionalId): unknown[] | undefined => {
  const btn = button as Record<string, unknown>;
  return Array.isArray(btn.group) ? btn.group : undefined;
};

const validateButtonRecursive = (
  button: ButtonConfigWithOptionalId,
  path: string[],
  errors: ValidationError[]
): void => {
  if (hasCommandAndGroup(button)) {
    errors.push({
      buttonId: button.id,
      buttonName: button.name,
      message: "Cannot have both 'command' and 'group'. Please remove one.",
      path,
      rawCommand: getRawCommand(button),
      rawGroup: getRawGroup(button),
    });
  } else if (hasNeitherCommandNorGroup(button)) {
    errors.push({
      buttonId: button.id,
      buttonName: button.name,
      message: "Button must have either 'command' or 'group'.",
      path,
    });
  }

  if ("group" in button && Array.isArray(button.group)) {
    button.group.forEach((child, index) => {
      validateButtonRecursive(child, [...path, button.name, `[${index}]`], errors);
    });
  }
};

export const validateButtonConfigs = (buttons: ButtonConfigWithOptionalId[]): ValidationResult => {
  const errors: ValidationError[] = [];

  buttons.forEach((button, index) => {
    validateButtonRecursive(button, [`buttons[${index}]`], errors);
  });

  return {
    errors,
    hasErrors: errors.length > 0,
  };
};

export const formatValidationErrorMessage = (errors: ValidationError[]): string => {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return `Configuration issue: "${errors[0].buttonName}" has both command and group set.`;
  }

  return `${errors.length} configuration issues found. Click "Fix Now" to resolve.`;
};
