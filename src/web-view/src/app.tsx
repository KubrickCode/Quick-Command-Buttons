import { useState, useEffect } from "react";
import { type ButtonConfig } from "./types";
import { ButtonList } from "./components/button-list";
import { ButtonForm } from "./components/button-form";
import { Header } from "./components/header";

const App = () => {
  const [buttons, setButtons] = useState<ButtonConfig[]>([]);
  const [editingButton, setEditingButton] = useState<ButtonConfig | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Request configuration from VS Code
    vscode.postMessage({ type: "getConfig" });

    // Listen for messages from VS Code
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "configData") {
        setButtons(message.data || []);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const saveConfig = () => {
    vscode.postMessage({ type: "setConfig", data: buttons });
  };

  const addButton = (button: ButtonConfig) => {
    const newButtons = [...buttons, button];
    setButtons(newButtons);
    setShowForm(false);
    setEditingButton(null);
  };

  const updateButton = (index: number, button: ButtonConfig) => {
    const newButtons = [...buttons];
    newButtons[index] = button;
    setButtons(newButtons);
    setShowForm(false);
    setEditingButton(null);
  };

  const deleteButton = (index: number) => {
    const newButtons = buttons.filter((_, i) => i !== index);
    setButtons(newButtons);
  };

  const startEdit = (button: ButtonConfig, index: number) => {
    setEditingButton({ ...button, index: index });
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
          buttons={buttons}
          onEdit={startEdit}
          onDelete={deleteButton}
        />

        {showForm && (
          <ButtonForm
            button={editingButton}
            onSave={(button) => {
              if (editingButton?.index !== undefined) {
                updateButton(editingButton.index, button);
              } else {
                addButton(button);
              }
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingButton(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
