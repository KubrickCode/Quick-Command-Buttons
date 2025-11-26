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

import {
  MESSAGE_TYPE,
  MESSAGES,
  CONFIGURATION_TARGET,
  TOAST_DURATION,
} from "../../../shared/constants";
import type {
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
import { type ButtonConfig } from "../types";
import { parsePathIndices, updateButtonAtPath } from "../utils/validation-path";

type VscodeCommandContextType = {
  addCommand: (command: ButtonConfig) => void;
  commands: ButtonConfig[];
  configurationTarget: ConfigurationTarget;
  deleteCommand: (index: number) => void;
  isSwitchingScope: boolean;
  removeCommandFromButton: (buttonId: string, error: ValidationError) => void;
  removeGroupFromButton: (buttonId: string, error: ValidationError) => void;
  reorderCommands: (newCommands: ButtonConfig[]) => void;
  saveConfig: () => void;
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
  const [commands, setCommands] = useState<ButtonConfig[]>([]);
  const [initialCommands, setInitialCommands] = useState<ButtonConfig[]>([]);
  const [configurationTarget, setConfigurationTargetState] = useState<ConfigurationTarget>(
    CONFIGURATION_TARGET.WORKSPACE
  );
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<ConfigurationTarget | null>(null);
  const [isSwitchingScope, setIsSwitchingScope] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const validationErrorsRef = useRef<ValidationError[]>([]);

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

          if (hasNewErrors && !hadErrors) {
            const count = newValidationErrors.length;
            const toastMessage =
              count === 1
                ? `Configuration issue: "${newValidationErrors[0].buttonName}" has both command and group set.`
                : `${count} configuration issues found. Check highlighted buttons.`;
            toast.warning(toastMessage, { duration: TOAST_DURATION.ERROR });
          }

          setCommands(message.data.buttons);
          setInitialCommands(message.data.buttons);
          setConfigurationTargetState(message.data.configurationTarget);
          setValidationErrors(newValidationErrors);
          validationErrorsRef.current = newValidationErrors;
          resolveRequest(message.requestId, message.data);
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

    sendMessage(MESSAGE_TYPE.GET_CONFIG).catch((error) => {
      console.error("Failed to load initial config:", error);
    });

    return () => {
      window.removeEventListener("message", handleMessage);
      clearAllRequests();
    };
  }, [clearAllRequests, rejectRequest, resolveRequest, sendMessage]);

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
      toast.success(MESSAGES.SUCCESS.configSaved, { duration: TOAST_DURATION.SUCCESS });
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.error(MESSAGES.ERROR.configSaveFailed, { duration: TOAST_DURATION.ERROR });
    }
  };

  const addCommand = (command: ButtonConfig) => {
    setCommands((prev) => [...prev, command]);
  };

  const updateCommand = (index: number, command: ButtonConfig) => {
    setCommands((prev) => {
      const newCommands = [...prev];
      newCommands[index] = command;
      return newCommands;
    });
  };

  const deleteCommand = (index: number) => {
    setCommands((prev) => prev.filter((_, i) => i !== index));
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
      toast.success("Command removed and saved", { duration: TOAST_DURATION.SUCCESS });
    } catch (err) {
      console.error("Failed to save after removing command:", err);
      toast.error("Failed to save changes", { duration: TOAST_DURATION.ERROR });
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
      toast.success("Group removed and saved", { duration: TOAST_DURATION.SUCCESS });
    } catch (err) {
      console.error("Failed to save after removing group:", err);
      toast.error("Failed to save changes", { duration: TOAST_DURATION.ERROR });
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

  return (
    <>
      <VscodeCommandContext.Provider
        value={{
          addCommand,
          commands,
          configurationTarget,
          deleteCommand,
          isSwitchingScope,
          removeCommandFromButton,
          removeGroupFromButton,
          reorderCommands,
          saveConfig,
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
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription className="sr-only">
              Confirm how to handle unsaved changes
            </DialogDescription>
          </DialogHeader>
          <DialogBody>You have unsaved changes. What would you like to do?</DialogBody>
          <DialogFooter>
            <Button onClick={handleCancelSwitch} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleDiscardAndSwitch} variant="ghost">
              Don't Save
            </Button>
            <Button onClick={handleSaveAndSwitch}>Save & Switch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
