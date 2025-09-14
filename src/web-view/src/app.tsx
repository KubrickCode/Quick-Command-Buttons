import { useState, useEffect } from "react";
import { type ButtonConfig } from "./types";
import { ButtonList } from "./components/button-list";
import { ButtonFormDialog } from "./components/button-form-dialog";
import { Header } from "./components/header";
import { vscodeApi, isDevelopment } from "./core/vscode-api.tsx";
import { mockCommands } from "./mock/mock-data.tsx";

const App = () => {
  const [commands, setCommands] = useState<ButtonConfig[]>([]);
  const [editingCommand, setEditingCommand] = useState<ButtonConfig | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

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
    const newCommands = [...commands, command];
    setCommands(newCommands);
    setShowForm(false);
    setEditingCommand(null);
  };

  const updateCommand = (index: number, command: ButtonConfig) => {
    const newCommands = [...commands];
    newCommands[index] = command;
    setCommands(newCommands);
    setShowForm(false);
    setEditingCommand(null);
  };

  const deleteCommand = (index: number) => {
    const newCommands = commands.filter((_, i) => i !== index);
    setCommands(newCommands);
  };

  const startEdit = (command: ButtonConfig, index: number) => {
    setEditingCommand({ ...command, index: index });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Header
          onAddButton={() => setShowForm(true)}
          onSaveConfig={saveConfig}
        />

        <ButtonList
          commands={commands}
          onEdit={startEdit}
          onDelete={deleteCommand}
        />

        <ButtonFormDialog
          open={showForm}
          command={editingCommand}
          onSave={(command) => {
            if (editingCommand?.index !== undefined) {
              updateCommand(editingCommand.index, command);
            } else {
              addCommand(command);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingCommand(null);
          }}
        />
      </div>
    </div>
  );
};

export default App;
