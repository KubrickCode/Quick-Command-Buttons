import { zodResolver } from "@hookform/resolvers/zod";
import { Terminal, Code2, PenLine, ChevronDown, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
import { GroupCommandEditor } from "./group-command-editor";
import { GroupToSingleWarningDialog } from "./group-to-single-warning-dialog";
import { IconPicker } from "./icon-picker";
import { createCommandFormSchema } from "../schemas/command-form-schema";
import {
  type ButtonConfig,
  type ButtonConfigDraft,
  toDraft,
  toCommandButton,
  toGroupButton,
} from "../types";
import { parseVSCodeIconName } from "../utils/parse-vscode-icon-name";

type CommandFormProps = {
  command?: (ButtonConfig & { index?: number }) | null;
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
        group: undefined,
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

export const CommandForm = ({ command, formId, onSave }: CommandFormProps) => {
  const { t } = useTranslation();

  // Note: Shortcut uniqueness validation is handled at runtime in command-executor.ts
  // Shortcuts only need to be unique within the same group (QuickPick menu)
  const schema = useMemo(() => createCommandFormSchema(), []);

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

  // Parse initial name into icon and display text
  const initialParsed = useMemo(() => {
    const name = command?.name || "";
    return parseVSCodeIconName(name);
  }, [command?.name]);

  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(initialParsed.iconName);
  const [displayText, setDisplayText] = useState(initialParsed.displayText);

  const getCombinedName = (icon?: string, text?: string): string => {
    if (icon) {
      return `$(${icon})${text ? ` ${text}` : ""}`;
    }
    return text || "";
  };

  const handleIconChange = (icon: string | undefined) => {
    setSelectedIcon(icon);
    setValue("name", getCombinedName(icon, displayText));
  };

  const handleDisplayTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setDisplayText(newText);
    setValue("name", getCombinedName(selectedIcon, newText));
  };

  return (
    <form className="space-y-6" id={formId} onSubmit={onSubmit}>
      <div className="space-y-6">
        <div className="space-y-2">
          <FormLabel htmlFor="displayText">{t("commandForm.commandName")}</FormLabel>
          <div className="flex h-9 w-full rounded-md bg-background-subtle text-sm input-premium">
            <IconPicker onChange={handleIconChange} value={selectedIcon} />
            <input
              className="flex-1 bg-transparent px-3 py-1 outline-none placeholder:text-muted-foreground"
              id="displayText"
              onChange={handleDisplayTextChange}
              placeholder={t("commandForm.displayTextPlaceholder")}
              value={displayText}
            />
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <FormLabel>{t("commandForm.commandType")}</FormLabel>
          <RadioGroup
            className="flex space-x-6"
            onValueChange={handleGroupModeChange}
            value={isGroupMode ? "group" : "single"}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="single" value="single" />
              <Label htmlFor="single">{t("commandForm.singleCommand")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="group" value="group" />
              <Label htmlFor="group">{t("commandForm.groupCommands")}</Label>
            </div>
          </RadioGroup>
        </div>

        {!isGroupMode && (
          <>
            <div className="space-y-2">
              <FormLabel htmlFor="command">{t("commandForm.command")}</FormLabel>
              <Input
                aria-invalid={!!errors.command}
                id="command"
                placeholder={
                  useVsCodeApi
                    ? t("commandForm.commandPlaceholderVsCode")
                    : t("commandForm.commandPlaceholderTerminal")
                }
                {...register("command")}
              />
              {errors.command && (
                <p className="text-sm text-red-500">{t("commandForm.errors.commandRequired")}</p>
              )}
              {useVsCodeApi && (
                <p className="text-xs text-muted-foreground">
                  {t("commandForm.vsCodeApiTip")}{" "}
                  <a
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    href="https://code.visualstudio.com/api/references/commands"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("commandForm.browseCommands")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <FormLabel>{t("commandForm.executionMode")}</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full justify-between gap-2" type="button" variant="outline">
                    {useVsCodeApi ? (
                      <>
                        <Code2 className="h-4 w-4" />
                        <span className="flex-1 text-left">{t("commandForm.vsCodeApi")}</span>
                      </>
                    ) : insertOnly ? (
                      <>
                        <PenLine className="h-4 w-4" />
                        <span className="flex-1 text-left">{t("commandForm.insertOnlyDesc")}</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="h-4 w-4" />
                        <span className="flex-1 text-left">{t("commandForm.terminalDefault")}</span>
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
                      {t("commandForm.terminalDefault")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="gap-2" value="vscode-api">
                      <Code2 className="h-4 w-4" />
                      {t("commandForm.vsCodeApi")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className="gap-2" value="insert-only">
                      <PenLine className="h-4 w-4" />
                      {t("commandForm.insertOnlyDesc")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="terminalName">{t("commandForm.terminalName")}</FormLabel>
              <Input
                id="terminalName"
                placeholder={t("commandForm.terminalNamePlaceholder")}
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
                  label={t("commandForm.executeAll")}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-2">
              <FormLabel>{t("commandForm.groupCommandsLabel")}</FormLabel>
              <GroupCommandEditor
                commands={groupCommands || []}
                hasError={!!errors.group}
                onChange={(commands) => setValue("group", commands)}
              />
              {errors.group && (
                <p className="text-sm text-red-500">
                  {errors.group.message?.includes("at least one")
                    ? t("commandForm.errors.groupEmpty")
                    : t("commandForm.errors.groupCommandRequired")}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel htmlFor="color">{t("commandForm.color")}</FormLabel>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorInput id="color" onChange={field.onChange} value={field.value || ""} />
              )}
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="shortcut">{t("commandForm.shortcut")}</FormLabel>
            <Input
              id="shortcut"
              maxLength={1}
              placeholder={t("commandForm.shortcutPlaceholder")}
              {...register("shortcut")}
            />
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
