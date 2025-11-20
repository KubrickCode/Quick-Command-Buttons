import { useMemo } from "react";

import { Checkbox, FormLabel, Input, Label, RadioGroup, RadioGroupItem } from "~/core";

import { useCommandFormState } from "../hooks/use-command-form-state";
import { useCommandFormValidation } from "../hooks/use-command-form-validation";
import { type ButtonConfig } from "../types";
import { GroupCommandEditor } from "./group-command-editor";
import { GroupToSingleWarningDialog } from "./group-to-single-warning-dialog";

type CommandFormProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  formId?: string;
  onSave: (command: ButtonConfig) => void;
};

export const CommandForm = ({ command, formId, onSave }: CommandFormProps) => {
  const { formData, isGroupMode, saveCommand, setIsGroupMode, updateFormField } =
    useCommandFormState(command);

  const originalIsGroupMode = useMemo(() => command?.group !== undefined, [command]);

  const { handleConfirmConversion, handleSubmit, setShowWarningDialog, showWarningDialog } =
    useCommandFormValidation({
      formData,
      isGroupMode,
      originalIsGroupMode,
    });

  return (
    <form
      className="space-y-6"
      id={formId}
      onSubmit={(e) => handleSubmit(e, () => saveCommand(onSave))}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <FormLabel htmlFor="name">Command Name</FormLabel>
          <Input
            id="name"
            onChange={(e) => updateFormField("name", e.target.value)}
            placeholder="e.g., $(terminal) Terminal"
            required
            value={formData.name}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Command Type</FormLabel>
          <RadioGroup
            className="flex space-x-6"
            onValueChange={(value) => setIsGroupMode(value === "group")}
            value={isGroupMode ? "group" : "single"}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="single" value="single" />
              <Label htmlFor="single">Single Command</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="group" value="group" />
              <Label htmlFor="group">Group Commands</Label>
            </div>
          </RadioGroup>
        </div>

        {!isGroupMode && (
          <>
            <div className="space-y-2">
              <FormLabel htmlFor="command">Command</FormLabel>
              <Input
                id="command"
                onChange={(e) => updateFormField("command", e.target.value)}
                placeholder="e.g., npm start"
                value={formData.command}
              />
            </div>
            <Checkbox
              checked={formData.useVsCodeApi}
              id="useVsCodeApi"
              label="Use VS Code API (instead of terminal)"
              onCheckedChange={(checked) => updateFormField("useVsCodeApi", !!checked)}
            />
            <div className="space-y-2">
              <FormLabel htmlFor="terminalName">Terminal Name (optional)</FormLabel>
              <Input
                id="terminalName"
                onChange={(e) => updateFormField("terminalName", e.target.value)}
                placeholder="e.g., Build Terminal"
                value={formData.terminalName}
              />
            </div>
          </>
        )}

        {isGroupMode && (
          <div className="space-y-4">
            <Checkbox
              checked={formData.executeAll}
              id="executeAll"
              label="Execute all commands simultaneously"
              onCheckedChange={(checked) => updateFormField("executeAll", !!checked)}
            />
            <div className="space-y-2">
              <FormLabel>Group Commands</FormLabel>
              <GroupCommandEditor
                commands={formData.group || []}
                onChange={(commands) => updateFormField("group", commands)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="color">Color (optional)</FormLabel>
            <Input
              id="color"
              onChange={(e) => updateFormField("color", e.target.value)}
              placeholder="e.g., #FF5722, red, blue"
              value={formData.color}
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="shortcut">Shortcut (optional)</FormLabel>
            <Input
              id="shortcut"
              maxLength={1}
              onChange={(e) => updateFormField("shortcut", e.target.value)}
              placeholder="e.g., t"
              value={formData.shortcut}
            />
          </div>
        </div>
      </div>

      <GroupToSingleWarningDialog
        childCount={formData.group?.length || 0}
        commandName={formData.name || "this command"}
        onConfirm={handleConfirmConversion}
        onOpenChange={setShowWarningDialog}
        open={showWarningDialog}
      />
    </form>
  );
};
