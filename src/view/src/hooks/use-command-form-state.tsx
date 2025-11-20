import { useCallback, useState } from "react";

import { type ButtonConfig } from "../types";

type FormState = {
  formData: ButtonConfig;
  isGroupMode: boolean;
};

type FormActions = {
  saveCommand: (onSave: (command: ButtonConfig) => void) => void;
  setIsGroupMode: (isGroup: boolean) => void;
  updateFormField: <K extends keyof ButtonConfig>(field: K, value: ButtonConfig[K]) => void;
};

const createInitialFormData = (
  command?: (ButtonConfig & { index?: number }) | null
): ButtonConfig => {
  return (
    command ?? {
      color: "",
      command: "",
      executeAll: false,
      group: [],
      id: crypto.randomUUID(),
      name: "",
      shortcut: "",
      terminalName: "",
      useVsCodeApi: false,
    }
  );
};

export const useCommandFormState = (
  command?: (ButtonConfig & { index?: number }) | null
): FormState & FormActions => {
  const [formData, setFormData] = useState<ButtonConfig>(() => createInitialFormData(command));
  const [isGroupMode, setIsGroupMode] = useState(command?.group !== undefined);

  const updateFormField = useCallback(
    <K extends keyof ButtonConfig>(field: K, value: ButtonConfig[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const saveCommand = useCallback(
    (onSave: (command: ButtonConfig) => void) => {
      const commandConfig: ButtonConfig = {
        color: formData.color || undefined,
        id: formData.id,
        name: formData.name.trim(),
        shortcut: formData.shortcut || undefined,
      };

      if (isGroupMode) {
        commandConfig.group = formData.group;
        commandConfig.executeAll = formData.executeAll;
      } else {
        commandConfig.command = formData.command;
        commandConfig.useVsCodeApi = formData.useVsCodeApi;
        commandConfig.terminalName = formData.terminalName || undefined;
      }

      onSave(commandConfig);
    },
    [formData, isGroupMode]
  );

  return {
    formData,
    isGroupMode,
    saveCommand,
    setIsGroupMode,
    updateFormField,
  };
};
