import isEqual from "fast-deep-equal";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import {
  MESSAGE_TYPE,
  MESSAGES,
  CONFIGURATION_TARGET,
  TOAST_DURATION,
} from "../../../shared/constants";
import type { ExtensionMessage } from "../../../shared/types";
import { Button } from "../core/button";
import {
  Dialog,
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

type VscodeCommandContextType = {
  addCommand: (command: ButtonConfig) => void;
  commands: ButtonConfig[];
  configurationTarget: string;
  deleteCommand: (index: number) => void;
  reorderCommands: (newCommands: ButtonConfig[]) => void;
  saveConfig: () => void;
  setConfigurationTarget: (target: string) => void;
  updateCommand: (index: number, command: ButtonConfig) => void;
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
  const [configurationTarget, setConfigurationTargetState] = useState<string>(
    CONFIGURATION_TARGET.WORKSPACE
  );
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const { clearAllRequests, resolveRequest, sendMessage } = useWebviewCommunication();

  useEffect(() => {
    const handleMessage = (event: { data: ExtensionMessage }) => {
      const message = event.data;

      switch (message.type) {
        case "configData":
          setCommands(message.data.buttons);
          setInitialCommands(message.data.buttons);
          setConfigurationTargetState(message.data.configurationTarget);
          resolveRequest(message.requestId);
          break;

        case "success":
          resolveRequest(message.requestId);
          break;

        case "error":
          console.error(MESSAGES.ERROR.extensionError(message.error));
          resolveRequest(message.requestId);
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
  }, [clearAllRequests, resolveRequest, sendMessage]);

  const hasUnsavedChanges = (): boolean => {
    return !isEqual(commands, initialCommands);
  };

  const saveConfig = async () => {
    try {
      if (isDevelopment && vscodeApi.setCurrentData) {
        vscodeApi.setCurrentData(commands);
      } else {
        await sendMessage(MESSAGE_TYPE.SET_CONFIG, commands);
      }
      setInitialCommands(commands);
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

  const switchConfigurationTarget = async (target: string) => {
    try {
      await sendMessage(MESSAGE_TYPE.SET_CONFIGURATION_TARGET, { target });
    } catch (error) {
      console.error("Failed to set configuration target:", error);
      setConfigurationTargetState(configurationTarget);
    }
  };

  const setConfigurationTarget = async (target: string) => {
    if (hasUnsavedChanges()) {
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
          reorderCommands,
          saveConfig,
          setConfigurationTarget,
          updateCommand,
        }}
      >
        {children}
      </VscodeCommandContext.Provider>

      <Dialog onOpenChange={setShowUnsavedDialog} open={showUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. What would you like to do?
            </DialogDescription>
          </DialogHeader>
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
