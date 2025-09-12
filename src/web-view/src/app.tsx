import { useState, useEffect } from "react";

interface ButtonConfig {
  name: string;
  command?: string;
  useVsCodeApi?: boolean;
  color?: string;
  shortcut?: string;
  terminalName?: string;
  executeAll?: boolean;
  group?: ButtonConfig[];
  index?: number;
}

interface VSCodeMessage {
  type:
    | "getConfig"
    | "setConfig"
    | "addButton"
    | "deleteButton"
    | "updateButton";
  data?: any;
}

declare const vscode: {
  postMessage(message: VSCodeMessage): void;
};

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

        {/* Button List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Current Buttons
            </h2>
            {buttons.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No buttons configured. Add your first button to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {buttons.map((button, index) => (
                  <ButtonCard
                    key={index}
                    button={button}
                    onEdit={() => startEdit(button, index)}
                    onDelete={() => deleteButton(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Button Form Modal */}
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

interface ButtonCardProps {
  button: ButtonConfig;
  onEdit: () => void;
  onDelete: () => void;
}

const ButtonCard = ({ button, onEdit, onDelete }: ButtonCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <span
            className="font-medium"
            style={{ color: button.color || "#374151" }}
          >
            {button.name}
          </span>
          {button.shortcut && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded font-mono">
              {button.shortcut}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {button.group ? (
            <span className="text-blue-600">
              Group with {button.group.length} commands
            </span>
          ) : (
            <span className="font-mono">{button.command || "No command"}</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit button"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete button"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface ButtonFormProps {
  button?: (ButtonConfig & { index?: number }) | null;
  onSave: (button: ButtonConfig) => void;
  onCancel: () => void;
}

const ButtonForm = ({ button, onSave, onCancel }: ButtonFormProps) => {
  const [formData, setFormData] = useState<ButtonConfig>({
    name: button?.name || "",
    command: button?.command || "",
    useVsCodeApi: button?.useVsCodeApi || false,
    color: button?.color || "",
    shortcut: button?.shortcut || "",
    terminalName: button?.terminalName || "",
    executeAll: button?.executeAll || false,
    group: button?.group || [],
  });

  const [isGroupMode, setIsGroupMode] = useState(!!button?.group?.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const buttonData: ButtonConfig = {
      name: formData.name.trim(),
      color: formData.color || undefined,
      shortcut: formData.shortcut || undefined,
    };

    if (isGroupMode) {
      buttonData.group = formData.group;
      buttonData.executeAll = formData.executeAll;
    } else {
      buttonData.command = formData.command;
      buttonData.useVsCodeApi = formData.useVsCodeApi;
      buttonData.terminalName = formData.terminalName || undefined;
    }

    onSave(buttonData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {button ? "Edit Button" : "Add New Button"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., $(terminal) Terminal"
                required
              />
            </div>

            {/* Button Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isGroupMode}
                    onChange={() => setIsGroupMode(false)}
                    className="mr-2"
                  />
                  Single Command
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isGroupMode}
                    onChange={() => setIsGroupMode(true)}
                    className="mr-2"
                  />
                  Group Commands
                </label>
              </div>
            </div>

            {/* Single Command Fields */}
            {!isGroupMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Command
                  </label>
                  <input
                    type="text"
                    value={formData.command}
                    onChange={(e) =>
                      setFormData({ ...formData, command: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., npm start"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.useVsCodeApi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        useVsCodeApi: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Use VS Code API (instead of terminal)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terminal Name (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.terminalName}
                    onChange={(e) =>
                      setFormData({ ...formData, terminalName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Build Terminal"
                  />
                </div>
              </>
            )}

            {/* Group Mode Fields */}
            {isGroupMode && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.executeAll}
                    onChange={(e) =>
                      setFormData({ ...formData, executeAll: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Execute all commands simultaneously
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Commands (JSON format)
                  </label>
                  <textarea
                    value={JSON.stringify(formData.group, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData({ ...formData, group: parsed });
                      } catch {
                        // Invalid JSON, keep as is for now
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder='[{"name": "Status", "command": "git status", "shortcut": "s"}]'
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color (optional)
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., #FF5722"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shortcut (optional)
                </label>
                <input
                  type="text"
                  value={formData.shortcut}
                  onChange={(e) =>
                    setFormData({ ...formData, shortcut: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., t"
                  maxLength={1}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {button ? "Update Button" : "Add Button"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
