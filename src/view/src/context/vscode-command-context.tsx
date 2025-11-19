import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { MESSAGE_TYPE, MESSAGES, CONFIGURATION_TARGET } from "../../../shared/constants";
import type { ExtensionMessage } from "../../../shared/types";
import { vscodeApi, isDevelopment } from "../core/vscode-api.tsx";
import { useWebviewCommunication } from "../hooks/use-webview-communication";
import { mockCommands } from "../mock/mock-data.tsx";
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
  const [configurationTarget, setConfigurationTargetState] = useState<string>(
    CONFIGURATION_TARGET.WORKSPACE
  );

  const { clearAllRequests, resolveRequest, sendMessage } = useWebviewCommunication();

  useEffect(() => {
    if (isDevelopment) {
      setCommands([...mockCommands]);
      return;
    }

    const handleMessage = (event: { data: ExtensionMessage }) => {
      const message = event.data;

      switch (message.type) {
        case "configData":
          setCommands(message.data.buttons);
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

  const saveConfig = async () => {
    if (isDevelopment && vscodeApi.setCurrentData) {
      vscodeApi.setCurrentData(commands);
      return;
    }

    try {
      await sendMessage(MESSAGE_TYPE.SET_CONFIG, commands);
    } catch (error) {
      console.error("Failed to save config:", error);
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

  const setConfigurationTarget = async (target: string) => {
    setConfigurationTargetState(target);
    if (!isDevelopment) {
      try {
        await sendMessage(MESSAGE_TYPE.SET_CONFIGURATION_TARGET, { target });
      } catch (error) {
        console.error("Failed to set configuration target:", error);
      }
    }
  };

  return (
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
  );
};
