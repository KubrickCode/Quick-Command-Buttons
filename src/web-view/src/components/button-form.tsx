import { useState } from "react";
import { type ButtonConfig } from "../types";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "~/core";

type ButtonFormProps = {
  button?: (ButtonConfig & { index?: number }) | null;
  onCancel: () => void;
  onSave: (button: ButtonConfig) => void;
};

export const ButtonForm = ({ button, onSave, onCancel }: ButtonFormProps) => {
  const [formData, setFormData] = useState<ButtonConfig>({
    name: button?.name || "",
    command: button?.command || "",
    useVsCodeApi: button?.useVsCodeApi || false,
    color: button?.color || "",
    shortcut: button?.shortcut || "",
    terminalName: button?.terminalName || "",
    executeAll: button?.executeAll || false,
    group: button?.group || [],
  });

  const [isGroupMode, setIsGroupMode] = useState(!!button?.group?.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const buttonData: ButtonConfig = {
      name: formData.name.trim(),
      color: formData.color || undefined,
      shortcut: formData.shortcut || undefined,
    };

    if (isGroupMode) {
      buttonData.group = formData.group;
      buttonData.executeAll = formData.executeAll;
    } else {
      buttonData.command = formData.command;
      buttonData.useVsCodeApi = formData.useVsCodeApi;
      buttonData.terminalName = formData.terminalName || undefined;
    }

    onSave(buttonData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{button ? "Edit Button" : "Add New Button"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Button Name</Label>
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
              <Label>Button Type</Label>
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
              <>
                <Checkbox
                  id="executeAll"
                  label="Execute all commands simultaneously"
                  checked={formData.executeAll}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, executeAll: !!checked })
                  }
                />
                <div className="space-y-2">
                  <Label htmlFor="groupCommands">
                    Group Commands (JSON format)
                  </Label>
                  <Textarea
                    id="groupCommands"
                    value={JSON.stringify(formData.group, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData({ ...formData, group: parsed });
                      } catch {
                        // Invalid JSON, keep as is for now
                      }
                    }}
                    className="font-mono text-sm"
                    rows={8}
                    placeholder='[{"name": "Status", "command": "git status", "shortcut": "s"}]'
                  />
                </div>
              </>
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
            <Button type="submit">
              {button ? "Update Button" : "Add Button"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
