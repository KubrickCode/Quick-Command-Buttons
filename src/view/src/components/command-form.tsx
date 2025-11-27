import { zodResolver } from "@hookform/resolvers/zod";
import { Terminal, Code2, PenLine, ChevronDown, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  FormLabel,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "~/core";

import { ColorInput } from "./color-input";
import { createCommandFormSchema } from "../schemas/command-form-schema";
import {
  type ButtonConfig,
  type ButtonConfigDraft,
  toDraft,
  toCommandButton,
  toGroupButton,
} from "../types";
import { GroupCommandEditor } from "./group-command-editor";
import { GroupToSingleWarningDialog } from "./group-to-single-warning-dialog";

type CommandFormProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  commands: ButtonConfig[];
  formId?: string;
  onSave: (command: ButtonConfig) => void;
};

const createDefaultValues = (command?: ButtonConfig | null): ButtonConfigDraft =>
  command
    ? toDraft(command)
    : {
        color: "",
        command: "",
        executeAll: false,
        group: [],
        id: crypto.randomUUID(),
        insertOnly: false,
        name: "",
        shortcut: "",
        terminalName: "",
        useVsCodeApi: false,
      };

const buildCommandConfig = (data: ButtonConfigDraft, isGroup: boolean): ButtonConfig => {
  const normalized: ButtonConfigDraft = {
    ...data,
    color: data.color || undefined,
    name: data.name.trim(),
    shortcut: data.shortcut || undefined,
    terminalName: data.terminalName || undefined,
  };

  return isGroup ? toGroupButton(normalized) : toCommandButton(normalized);
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
  } = useForm<ButtonConfigDraft>({
    defaultValues: createDefaultValues(command),
    mode: "onSubmit",
    // NOTE: Zod v4 recursive schema type constraints (see command-form-schema.ts for details)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
  });

  const hasGroup = command != null && "group" in command;
  const [isGroupMode, setIsGroupMode] = useState<boolean>(hasGroup);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingSave, setPendingSave] = useState<ButtonConfigDraft | null>(null);

  const originalIsGroupMode = useMemo(() => hasGroup, [hasGroup]);
  const groupCommands = watch("group");
  const commandName = watch("name");
  const useVsCodeApi = watch("useVsCodeApi");
  const insertOnly = watch("insertOnly");

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
              <Input
                id="command"
                placeholder={
                  useVsCodeApi ? "e.g., workbench.action.terminal.new" : "e.g., npm start"
                }
                {...register("command")}
              />
              {useVsCodeApi && (
                <p className="text-xs text-muted-foreground">
                  Tip: Open Command Palette (Ctrl+Shift+P), find command, right-click → Copy Command
                  ID.{" "}
                  <a
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    href="https://code.visualstudio.com/api/references/commands"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Browse commands
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <FormLabel>Execution Mode</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-between gap-2" type="button" variant="outline">
                    {useVsCodeApi ? (
                      <>
                        <Code2 className="h-4 w-4" />
                        <span className="flex-1 text-left">VS Code API</span>
                      </>
                    ) : insertOnly ? (
                      <>
                        <PenLine className="h-4 w-4" />
                        <span className="flex-1 text-left">Insert Only (don't execute)</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4" />
                        <span className="flex-1 text-left">Terminal (default)</span>
                      </>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  <DropdownMenuRadioGroup
                    onValueChange={(value) => {
                      setValue("useVsCodeApi", value === "vscode-api");
                      setValue("insertOnly", value === "insert-only");
                    }}
                    value={useVsCodeApi ? "vscode-api" : insertOnly ? "insert-only" : "terminal"}
                  >
                    <DropdownMenuRadioItem className="gap-2" value="terminal">
                      <Terminal className="h-4 w-4" />
                      Terminal (default)
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="gap-2" value="vscode-api">
                      <Code2 className="h-4 w-4" />
                      VS Code API
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="gap-2" value="insert-only">
                      <PenLine className="h-4 w-4" />
                      Insert Only (don't execute)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorInput id="color" onChange={field.onChange} value={field.value || ""} />
              )}
            />
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
