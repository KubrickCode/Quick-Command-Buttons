import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Checkbox, FormLabel, Input, Label, RadioGroup, RadioGroupItem } from "~/core";

import { createCommandFormSchema } from "../schemas/command-form-schema";
import { type ButtonConfig } from "../types";
import { GroupCommandEditor } from "./group-command-editor";
import { GroupToSingleWarningDialog } from "./group-to-single-warning-dialog";

type CommandFormProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  commands: ButtonConfig[];
  formId?: string;
  onSave: (command: ButtonConfig) => void;
};

const createDefaultValues = (
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

const buildCommandConfig = (data: ButtonConfig, isGroup: boolean): ButtonConfig => {
  const commandConfig: ButtonConfig = {
    ...data,
    color: data.color || undefined,
    name: data.name.trim(),
    shortcut: data.shortcut || undefined,
    terminalName: data.terminalName || undefined,
  };

  if (isGroup) {
    commandConfig.command = undefined;
    commandConfig.useVsCodeApi = undefined;
  } else {
    commandConfig.group = undefined;
    commandConfig.executeAll = undefined;
  }

  return commandConfig;
};

export const CommandForm = ({ command, commands, formId, onSave }: CommandFormProps) => {
  const schema = useMemo(
    () => createCommandFormSchema(commands, command?.id),
    [commands, command?.id]
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<ButtonConfig>({
    defaultValues: createDefaultValues(command),
    mode: "onSubmit",
    // NOTE: Zod v4 recursive schema type constraints (see command-form-schema.ts for details)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  });

  const [isGroupMode, setIsGroupMode] = useState(command?.group !== undefined);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<ButtonConfig | null>(null);

  const originalIsGroupMode = useMemo(() => command?.group !== undefined, [command]);
  const groupCommands = watch("group");
  const commandName = watch("name");

  const onSubmit = handleSubmit((data) => {
    const hasChildCommands = data.group && data.group.length > 0;
    const isConvertingToSingle = originalIsGroupMode && !isGroupMode && hasChildCommands;

    if (isConvertingToSingle) {
      setPendingSave(data);
      setShowWarningDialog(true);
      return;
    }

    onSave(buildCommandConfig(data, isGroupMode));
  });

  const handleConfirmConversion = () => {
    if (pendingSave) {
      onSave(buildCommandConfig(pendingSave, false));
      setPendingSave(null);
    }
  };

  const handleGroupModeChange = (value: string) => {
    setIsGroupMode(value === "group");
  };

  return (
    <form className="space-y-6" id={formId} onSubmit={onSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <FormLabel htmlFor="name">Command Name</FormLabel>
          <Input id="name" placeholder="e.g., $(terminal) Terminal" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <FormLabel>Command Type</FormLabel>
          <RadioGroup
            className="flex space-x-6"
            onValueChange={handleGroupModeChange}
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
              <Input id="command" placeholder="e.g., npm start" {...register("command")} />
            </div>
            <Controller
              control={control}
              name="useVsCodeApi"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  id="useVsCodeApi"
                  label="Use VS Code API (instead of terminal)"
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-2">
              <FormLabel htmlFor="terminalName">Terminal Name (optional)</FormLabel>
              <Input
                id="terminalName"
                placeholder="e.g., Build Terminal"
                {...register("terminalName")}
              />
            </div>
          </>
        )}

        {isGroupMode && (
          <div className="space-y-4">
            <Controller
              control={control}
              name="executeAll"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  id="executeAll"
                  label="Execute all commands simultaneously"
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-2">
              <FormLabel>Group Commands</FormLabel>
              <GroupCommandEditor
                commands={groupCommands || []}
                onChange={(commands) => setValue("group", commands)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="color">Color (optional)</FormLabel>
            <Input id="color" placeholder="e.g., #FF5722, red, blue" {...register("color")} />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="shortcut">Shortcut (optional)</FormLabel>
            <Input id="shortcut" maxLength={1} placeholder="e.g., t" {...register("shortcut")} />
            {errors.shortcut && <p className="text-sm text-red-500">{errors.shortcut.message}</p>}
          </div>
        </div>
      </div>

      <GroupToSingleWarningDialog
        childCount={groupCommands?.length || 0}
        commandName={commandName || "this command"}
        onConfirm={handleConfirmConversion}
        onOpenChange={setShowWarningDialog}
        open={showWarningDialog}
      />
    </form>
  );
};
