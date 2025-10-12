import { useState } from "react";

import { Checkbox, FormLabel, Input, Label, RadioGroup, RadioGroupItem } from "~/core";

import { type ButtonConfig } from "../types";
import { GroupCommandEditor } from "./group-command-editor";
import { GroupToSingleWarningDialog } from "./group-to-single-warning-dialog";

type CommandFormProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  formId?: string;
  onSave: (command: ButtonConfig) => void;
};

export const CommandForm = ({ command, formId, onSave }: CommandFormProps) => {
  const [formData, setFormData] = useState<ButtonConfig>(
    command ?? {
      color: "",
      command: "",
      executeAll: false,
      group: [],
      name: "",
      shortcut: "",
      terminalName: "",
      useVsCodeApi: false,
    }
  );

  const [isGroupMode, setIsGroupMode] = useState(command?.group !== undefined);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const originalIsGroupMode = command?.group !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const hasChildCommands = formData.group && formData.group.length > 0;
    const isConvertingToSingle = originalIsGroupMode && !isGroupMode && hasChildCommands;

    if (isConvertingToSingle) {
      setShowWarningDialog(true);
      return;
    }

    saveCommand();
  };

  const saveCommand = () => {
    const commandConfig: ButtonConfig = {
      color: formData.color || undefined,
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
  };

  const handleConfirmConversion = () => {
    saveCommand();
  };

  return (
    <form className="space-y-6" id={formId} onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <FormLabel htmlFor="name">Command Name</FormLabel>
          <Input
            id="name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                placeholder="e.g., npm start"
                value={formData.command}
              />
            </div>
            <Checkbox
              checked={formData.useVsCodeApi}
              id="useVsCodeApi"
              label="Use VS Code API (instead of terminal)"
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  useVsCodeApi: !!checked,
                })
              }
            />
            <div className="space-y-2">
              <FormLabel htmlFor="terminalName">Terminal Name (optional)</FormLabel>
              <Input
                id="terminalName"
                onChange={(e) => setFormData({ ...formData, terminalName: e.target.value })}
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
              onCheckedChange={(checked) => setFormData({ ...formData, executeAll: !!checked })}
            />
            <div className="space-y-2">
              <FormLabel>Group Commands</FormLabel>
              <GroupCommandEditor
                commands={formData.group || []}
                onChange={(commands) => setFormData({ ...formData, group: commands })}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="color">Color (optional)</FormLabel>
            <Input
              id="color"
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g., #FF5722, red, blue"
              value={formData.color}
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="shortcut">Shortcut (optional)</FormLabel>
            <Input
              id="shortcut"
              maxLength={1}
              onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
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
