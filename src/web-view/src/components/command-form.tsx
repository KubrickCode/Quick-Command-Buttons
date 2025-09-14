import { useState } from "react";
import { type ButtonConfig } from "../types";
import {
  Button,
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "~/core";
import { GroupCommandEditor } from "./group-command-editor";

type CommandFormProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  onCancel: () => void;
  onSave: (command: ButtonConfig) => void;
};

export const CommandForm = ({ command, onSave, onCancel }: CommandFormProps) => {
  const [formData, setFormData] = useState<ButtonConfig>(
    command ?? {
      name: "",
      command: "",
      useVsCodeApi: false,
      color: "",
      shortcut: "",
      terminalName: "",
      executeAll: false,
      group: [],
    }
  );

  const [isGroupMode, setIsGroupMode] = useState(!!command?.group?.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const commandConfig: ButtonConfig = {
      name: formData.name.trim(),
      color: formData.color || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Command Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., $(terminal) Terminal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Command Type</Label>
          <RadioGroup
            value={isGroupMode ? "group" : "single"}
            onValueChange={(value) => setIsGroupMode(value === "group")}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single">Single Command</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="group" id="group" />
              <Label htmlFor="group">Group Commands</Label>
            </div>
          </RadioGroup>
        </div>

        {!isGroupMode && (
          <>
            <div className="space-y-2">
              <Label htmlFor="command">Command</Label>
              <Input
                id="command"
                value={formData.command}
                onChange={(e) =>
                  setFormData({ ...formData, command: e.target.value })
                }
                placeholder="e.g., npm start"
              />
            </div>
            <Checkbox
              id="useVsCodeApi"
              label="Use VS Code API (instead of terminal)"
              checked={formData.useVsCodeApi}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  useVsCodeApi: !!checked,
                })
              }
            />
            <div className="space-y-2">
              <Label htmlFor="terminalName">Terminal Name (optional)</Label>
              <Input
                id="terminalName"
                value={formData.terminalName}
                onChange={(e) =>
                  setFormData({ ...formData, terminalName: e.target.value })
                }
                placeholder="e.g., Build Terminal"
              />
            </div>
          </>
        )}

        {isGroupMode && (
          <div className="space-y-4">
            <Checkbox
              id="executeAll"
              label="Execute all commands simultaneously"
              checked={formData.executeAll}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, executeAll: !!checked })
              }
            />
            <div className="space-y-2">
              <Label>Group Commands</Label>
              <GroupCommandEditor
                commands={formData.group || []}
                onChange={(commands) =>
                  setFormData({ ...formData, group: commands })
                }
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Color (optional)</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="e.g., #FF5722"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortcut">Shortcut (optional)</Label>
            <Input
              id="shortcut"
              value={formData.shortcut}
              onChange={(e) =>
                setFormData({ ...formData, shortcut: e.target.value })
              }
              placeholder="e.g., t"
              maxLength={1}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{command ? "Update" : "Add"}</Button>
      </div>
    </form>
  );
};
