import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type ButtonConfig } from "../types";
import { vscodeApi, isDevelopment } from "../core/vscode-api.tsx";
import { mockCommands } from "../mock/mock-data.tsx";

type VscodeCommandContextType = {
  commands: ButtonConfig[];
  configurationTarget: string;
  addCommand: (command: ButtonConfig) => void;
  updateCommand: (index: number, command: ButtonConfig) => void;
  deleteCommand: (index: number) => void;
  reorderCommands: (newCommands: ButtonConfig[]) => void;
  saveConfig: () => void;
  setConfigurationTarget: (target: string) => void;
};

const VscodeCommandContext = createContext<
  VscodeCommandContextType | undefined
>(undefined);

export const useVscodeCommand = () => {
  const context = useContext(VscodeCommandContext);
  if (context === undefined) {
    throw new Error(
      "useVscodeCommand must be used within a VscodeCommandProvider"
    );
  }
  return context;
};

type VscodeCommandProviderProps = {
  children: ReactNode;
};

export const VscodeCommandProvider = ({
  children,
}: VscodeCommandProviderProps) => {
  const [commands, setCommands] = useState<ButtonConfig[]>([]);
  const [configurationTarget, setConfigurationTargetState] =
    useState<string>("workspace");

  useEffect(() => {
    if (isDevelopment) {
      setCommands([...mockCommands]);
      return;
    }

    const requestConfig = () => {
      vscodeApi.postMessage({ type: "getConfig" });
    };

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.type === "configData") {
        if (
          message.data &&
          typeof message.data === "object" &&
          message.data.buttons
        ) {
          // New format with configurationTarget
          setCommands(message.data.buttons || []);
          setConfigurationTargetState(
            message.data.configurationTarget || "workspace"
          );
        } else {
          // Old format (backward compatibility)
          setCommands(message.data || []);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    requestConfig();

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const saveConfig = () => {
    if (isDevelopment && vscodeApi.setCurrentData) {
      vscodeApi.setCurrentData(commands);
      return;
    }
    vscodeApi.postMessage({ type: "setConfig", data: commands });
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

  const setConfigurationTarget = (target: string) => {
    setConfigurationTargetState(target);
    if (!isDevelopment) {
      vscodeApi.postMessage({ type: "setConfigurationTarget", target });
    }
  };

  return (
    <VscodeCommandContext.Provider
      value={{
        commands,
        configurationTarget,
        addCommand,
        updateCommand,
        deleteCommand,
        reorderCommands,
        saveConfig,
        setConfigurationTarget,
      }}
    >
      {children}
    </VscodeCommandContext.Provider>
  );
};
