import { useState, useEffect } from "react";
import { vscode, type ButtonConfig } from "./types";
import { ButtonList } from "./button-list";
import { ButtonForm } from "./button-form";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Quick Command Buttons Configuration
          </h1>
          <div className="space-x-3">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Button
            </button>
            <button
              onClick={saveConfig}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>

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
