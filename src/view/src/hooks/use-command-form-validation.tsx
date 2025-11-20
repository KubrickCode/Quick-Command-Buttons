import { useCallback, useState } from "react";

import { type ButtonConfig } from "../types";

type ValidationResult = {
  handleConfirmConversion: () => void;
  handleSubmit: (e: React.FormEvent, onSave: () => void) => void;
  setShowWarningDialog: (show: boolean) => void;
  showWarningDialog: boolean;
};

type UseCommandFormValidationProps = {
  formData: ButtonConfig;
  isGroupMode: boolean;
  originalIsGroupMode: boolean;
};

export const useCommandFormValidation = ({
  formData,
  isGroupMode,
  originalIsGroupMode,
}: UseCommandFormValidationProps): ValidationResult => {
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<(() => void) | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent, onSave: () => void) => {
      e.preventDefault();

      // Validate required name field
      if (!formData.name.trim()) return;

      // Check if converting group to single command
      const hasChildCommands = formData.group && formData.group.length > 0;
      const isConvertingToSingle = originalIsGroupMode && !isGroupMode && hasChildCommands;

      if (isConvertingToSingle) {
        setPendingSave(() => onSave);
        setShowWarningDialog(true);
        return;
      }

      onSave();
    },
    [formData.name, formData.group, originalIsGroupMode, isGroupMode]
  );

  const handleConfirmConversion = useCallback(() => {
    if (pendingSave) {
      pendingSave();
      setPendingSave(null);
    }
  }, [pendingSave]);

  return {
    handleConfirmConversion,
    handleSubmit,
    setShowWarningDialog,
    showWarningDialog,
  };
};
