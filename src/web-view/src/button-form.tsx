import { useState } from "react";
import { type ButtonConfig } from "./types";

type ButtonFormProps = {
  button?: (ButtonConfig & { index?: number }) | null;
  onCancel: () => void;
  onSave: (button: ButtonConfig) => void;
};

export const ButtonForm = ({ button, onSave, onCancel }: ButtonFormProps) => {
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
