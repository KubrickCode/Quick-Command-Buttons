import isEqual from "fast-deep-equal";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

import {
  MESSAGE_TYPE,
  MESSAGES,
  CONFIGURATION_TARGET,
  TOAST_DURATION,
} from "../../../shared/constants";
import type {
  ButtonSet,
  CommandButton,
  ConfigurationTarget,
  ExtensionMessage,
  GroupButton,
  ValidationError,
} from "../../../shared/types";
import { isCommandButton, isGroupButton } from "../../../shared/types";
import { Button } from "../core/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import { toast } from "../core/toast";
import { vscodeApi, isDevelopment } from "../core/vscode-api.tsx";
import { useWebviewCommunication } from "../hooks/use-webview-communication";
import { commandStore, useCommandStore } from "../stores/command-store";
import { type ButtonConfig } from "../types";
import { parsePathIndices, updateButtonAtPath } from "../utils/validation-path";

type VscodeCommandContextType = {
  activeSet: string | null;
  addCommand: (command: ButtonConfig) => void;
  buttonSets: ButtonSet[];
  commands: ButtonConfig[];
  configurationTarget: ConfigurationTarget;
  createButtonSet: (name: string) => Promise<{ error?: string; success: boolean }>;
  deleteButtonSet: (name: string) => Promise<void>;
  deleteCommand: (index: number) => void;
  isSwitchingScope: boolean;
  removeCommandFromButton: (buttonId: string, error: ValidationError) => void;
  removeGroupFromButton: (buttonId: string, error: ValidationError) => void;
  renameButtonSet: (
    currentName: string,
    newName: string
  ) => Promise<{ error?: string; success: boolean }>;
  reorderCommands: (newCommands: ButtonConfig[]) => void;
  saveConfig: () => void;
  setActiveSet: (name: string | null) => Promise<void>;
  setConfigurationTarget: (target: ConfigurationTarget) => void;
  updateCommand: (index: number, command: ButtonConfig) => void;
  validationErrors: ValidationError[];
};

const VscodeCommandContext = createContext<VscodeCommandContextType | undefined>(undefined);

export const useVscodeCommand = () => {
  const context = useContext(VscodeCommandContext);
  if (context === undefined) {
    throw new Error(MESSAGES.ERROR.contextRequired("useVscodeCommand"));
  }
  return context;
};

type VscodeCommandProviderProps = {
  children: ReactNode;
};

export const VscodeCommandProvider = ({ children }: VscodeCommandProviderProps) => {
  const { t } = useTranslation();
  const commands = useCommandStore((state) => state.commands);
  const setCommands = commandStore.getState().setCommands;
  const [initialCommands, setInitialCommands] = useState<ButtonConfig[]>([]);
  const [configurationTarget, setConfigurationTargetState] = useState<ConfigurationTarget>(
    CONFIGURATION_TARGET.WORKSPACE
  );
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<ConfigurationTarget | null>(null);
  const [isSwitchingScope, setIsSwitchingScope] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const validationErrorsRef = useRef<ValidationError[]>([]);
  const hasInitialized = useRef(false);
  const [buttonSets, setButtonSets] = useState<ButtonSet[]>([]);
  const [activeSet, setActiveSetState] = useState<string | null>(null);

  const { clearAllRequests, rejectRequest, resolveRequest, sendMessage } =
    useWebviewCommunication();

  useEffect(() => {
    const handleMessage = (event: { data: ExtensionMessage }) => {
      const message = event.data;

      switch (message.type) {
        case "configData": {
          const newValidationErrors = message.data.validationErrors || [];
          const hadErrors = validationErrorsRef.current.length > 0;
          const hasNewErrors = newValidationErrors.length > 0;

          setCommands(message.data.buttons);
          setInitialCommands(message.data.buttons);
          // Clear undo/redo history when external data changes (scope switch, button set switch, etc.)
          commandStore.temporal.getState().clear();
          setConfigurationTargetState(message.data.configurationTarget);
          setValidationErrors(newValidationErrors);
          validationErrorsRef.current = newValidationErrors;
          // Handle button sets data
          if ("buttonSets" in message.data) {
            setButtonSets(message.data.buttonSets as ButtonSet[]);
          }
          if ("activeSet" in message.data) {
            setActiveSetState(message.data.activeSet as string | null);
          }
          resolveRequest(message.requestId, message.data);

          // Show validation error toast only when transitioning from no errors to having errors
          if (hasNewErrors && !hadErrors) {
            const count = newValidationErrors.length;
            const toastMessage =
              count === 1
                ? t("toast.configIssue", {
                    message: newValidationErrors[0].message,
                    name: newValidationErrors[0].buttonName,
                  })
                : t("toast.configIssuesFound", { count });
            toast.warning(toastMessage, { duration: TOAST_DURATION.ERROR });
          }
          break;
        }

        case MESSAGE_TYPE.IMPORT_PREVIEW_RESULT:
          resolveRequest(message.requestId, message.data);
          break;

        case "success":
          resolveRequest(message.requestId, message.data);
          break;

        case "error":
          console.error(MESSAGES.ERROR.extensionError(message.error));
          rejectRequest(message.requestId, message.error);
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      sendMessage(MESSAGE_TYPE.GET_CONFIG).catch((error) => {
        console.error("Failed to load initial config:", error);
      });
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      clearAllRequests();
    };
  }, [clearAllRequests, rejectRequest, resolveRequest, sendMessage, t]);

  const hasUnsavedChanges = useMemo(
    () => !isEqual(commands, initialCommands),
    [commands, initialCommands]
  );

  const saveConfig = async () => {
    try {
      if (isDevelopment && vscodeApi.setCurrentData) {
        vscodeApi.setCurrentData(commands);
        setInitialCommands(commands);
      } else {
        await sendMessage(MESSAGE_TYPE.SET_CONFIG, commands);
      }
      toast.success(t("toast.configSaved"), { duration: TOAST_DURATION.SUCCESS });
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.error(t("toast.configSaveFailed"), { duration: TOAST_DURATION.ERROR });
    }
  };

  const addCommand = (command: ButtonConfig) => {
    const current = commandStore.getState().commands;
    setCommands([...current, command]);
  };

  const updateCommand = (index: number, command: ButtonConfig) => {
    const current = commandStore.getState().commands;
    const newCommands = [...current];
    newCommands[index] = command;
    setCommands(newCommands);
  };

  const deleteCommand = (index: number) => {
    const current = commandStore.getState().commands;
    setCommands(current.filter((_, i) => i !== index));
  };

  const reorderCommands = (newCommands: ButtonConfig[]) => {
    setCommands(newCommands);
  };

  const removeCommandFromButton = async (_buttonId: string, error: ValidationError) => {
    if (!error.rawGroup || error.rawGroup.length === 0) {
      console.warn(`Cannot remove command: no group exists in validation error`);
      return;
    }

    const indices = parsePathIndices(error.path);
    if (indices.length === 0) {
      console.warn(`Cannot parse path: ${error.path.join(" -> ")}`);
      return;
    }

    const updatedCommands = updateButtonAtPath(commands, indices, (button) => {
      const groupButton: GroupButton = {
        color: button.color,
        executeAll: isGroupButton(button) ? button.executeAll : undefined,
        group: error.rawGroup as ButtonConfig[],
        id: button.id,
        name: button.name,
        shortcut: button.shortcut,
      };
      return groupButton;
    });

    setCommands(updatedCommands);

    // Auto-save immediately
    try {
      if (isDevelopment && vscodeApi.setCurrentData) {
        vscodeApi.setCurrentData(updatedCommands);
        setInitialCommands(updatedCommands);
      } else {
        await sendMessage(MESSAGE_TYPE.SET_CONFIG, updatedCommands);
      }
      toast.success(t("toast.commandRemovedSaved"), { duration: TOAST_DURATION.SUCCESS });
    } catch (err) {
      console.error("Failed to save after removing command:", err);
      toast.error(t("toast.failedToSaveChanges"), { duration: TOAST_DURATION.ERROR });
    }
  };

  const removeGroupFromButton = async (_buttonId: string, error: ValidationError) => {
    if (!error.rawCommand) {
      console.warn(`Cannot remove group: no command exists in validation error`);
      return;
    }

    const indices = parsePathIndices(error.path);
    if (indices.length === 0) {
      console.warn(`Cannot parse path: ${error.path.join(" -> ")}`);
      return;
    }

    const updatedCommands = updateButtonAtPath(commands, indices, (button) => {
      const commandButton: CommandButton = {
        color: button.color,
        command: error.rawCommand as string,
        id: button.id,
        insertOnly: isCommandButton(button) ? button.insertOnly : undefined,
        name: button.name,
        shortcut: button.shortcut,
        terminalName: isCommandButton(button) ? button.terminalName : undefined,
        useVsCodeApi: isCommandButton(button) ? button.useVsCodeApi : undefined,
      };
      return commandButton;
    });

    setCommands(updatedCommands);

    // Auto-save immediately
    try {
      if (isDevelopment && vscodeApi.setCurrentData) {
        vscodeApi.setCurrentData(updatedCommands);
        setInitialCommands(updatedCommands);
      } else {
        await sendMessage(MESSAGE_TYPE.SET_CONFIG, updatedCommands);
      }
      toast.success(t("toast.groupRemovedSaved"), { duration: TOAST_DURATION.SUCCESS });
    } catch (err) {
      console.error("Failed to save after removing group:", err);
      toast.error(t("toast.failedToSaveChanges"), { duration: TOAST_DURATION.ERROR });
    }
  };

  const switchConfigurationTarget = async (target: ConfigurationTarget) => {
    setIsSwitchingScope(true);
    try {
      // The response will contain the new configuration data
      // The state will be updated by the separate "configData" message from the backend
      await sendMessage(MESSAGE_TYPE.SET_CONFIGURATION_TARGET, { target });
    } catch (error) {
      console.error("Failed to set configuration target:", error);
      setConfigurationTargetState(configurationTarget);
    } finally {
      setIsSwitchingScope(false);
    }
  };

  const setConfigurationTarget = async (target: ConfigurationTarget) => {
    // Prevent concurrent scope switches
    if (isSwitchingScope) return;

    if (hasUnsavedChanges) {
      setPendingTarget(target);
      setShowUnsavedDialog(true);
      return;
    }

    await switchConfigurationTarget(target);
  };

  const handleSaveAndSwitch = async () => {
    if (pendingTarget) {
      await saveConfig();
      await switchConfigurationTarget(pendingTarget);
      setShowUnsavedDialog(false);
      setPendingTarget(null);
    }
  };

  const handleDiscardAndSwitch = async () => {
    if (pendingTarget) {
      await switchConfigurationTarget(pendingTarget);
      setShowUnsavedDialog(false);
      setPendingTarget(null);
    }
  };

  const handleCancelSwitch = () => {
    setShowUnsavedDialog(false);
    setPendingTarget(null);
  };

  const setActiveSet = async (name: string | null) => {
    try {
      await sendMessage(MESSAGE_TYPE.SET_ACTIVE_SET, { setName: name });
      toast.success(
        name ? t("buttonSets.switchedTo", { name }) : t("buttonSets.switchedToDefault"),
        { duration: TOAST_DURATION.SUCCESS }
      );
    } catch (error) {
      console.error("Failed to set active set:", error);
      toast.error(t("buttonSets.switchFailed"), { duration: TOAST_DURATION.ERROR });
    }
  };

  const deleteButtonSet = async (name: string) => {
    try {
      await sendMessage(MESSAGE_TYPE.DELETE_BUTTON_SET, { name });
      toast.success(t("buttonSets.deleted", { name }), { duration: TOAST_DURATION.SUCCESS });
    } catch (error) {
      console.error("Failed to delete button set:", error);
      toast.error(t("buttonSets.deleteFailed"), { duration: TOAST_DURATION.ERROR });
    }
  };

  const createButtonSet = async (name: string): Promise<{ error?: string; success: boolean }> => {
    try {
      await sendMessage(MESSAGE_TYPE.CREATE_BUTTON_SET, { name });
      toast.success(t("buttonSets.created", { name }), { duration: TOAST_DURATION.SUCCESS });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(t("buttonSets.createFailed"), { duration: TOAST_DURATION.ERROR });
      return { error: errorMessage, success: false };
    }
  };

  const renameButtonSet = async (
    currentName: string,
    newName: string
  ): Promise<{ error?: string; success: boolean }> => {
    try {
      await sendMessage(MESSAGE_TYPE.RENAME_BUTTON_SET, { currentName, newName });
      toast.success(t("buttonSets.renamed", { name: newName }), {
        duration: TOAST_DURATION.SUCCESS,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to rename button set:", errorMessage, { currentName, newName });
      toast.error(t("buttonSets.renameFailed"), { duration: TOAST_DURATION.ERROR });
      return { error: errorMessage, success: false };
    }
  };

  return (
    <>
      <VscodeCommandContext.Provider
        value={{
          activeSet,
          addCommand,
          buttonSets,
          commands,
          configurationTarget,
          createButtonSet,
          deleteButtonSet,
          deleteCommand,
          isSwitchingScope,
          removeCommandFromButton,
          removeGroupFromButton,
          renameButtonSet,
          reorderCommands,
          saveConfig,
          setActiveSet,
          setConfigurationTarget,
          updateCommand,
          validationErrors,
        }}
      >
        {children}
      </VscodeCommandContext.Provider>

      <Dialog onOpenChange={setShowUnsavedDialog} open={showUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("unsavedChanges.title")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("unsavedChanges.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>{t("unsavedChanges.message")}</DialogBody>
          <DialogFooter>
            <Button onClick={handleCancelSwitch} variant="ghost">
              {t("unsavedChanges.cancel")}
            </Button>
            <Button onClick={handleDiscardAndSwitch} variant="ghost">
              {t("unsavedChanges.dontSave")}
            </Button>
            <Button onClick={handleSaveAndSwitch}>{t("unsavedChanges.saveAndSwitch")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
