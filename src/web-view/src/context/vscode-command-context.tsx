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
  addCommand: (command: ButtonConfig) => void;
  updateCommand: (index: number, command: ButtonConfig) => void;
  deleteCommand: (index: number) => void;
  saveConfig: () => void;
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
        setCommands(message.data || []);
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

  return (
    <VscodeCommandContext.Provider
      value={{
        commands,
        addCommand,
        updateCommand,
        deleteCommand,
        saveConfig,
      }}
    >
      {children}
    </VscodeCommandContext.Provider>
  );
};
