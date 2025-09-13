import { type ButtonConfig } from "./types";

type ButtonListProps = {
  buttons: ButtonConfig[];
  onEdit: (button: ButtonConfig, index: number) => void;
  onDelete: (index: number) => void;
};

export const ButtonList = ({ buttons, onEdit, onDelete }: ButtonListProps) => {
  return (
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
                onEdit={() => onEdit(button, index)}
                onDelete={() => onDelete(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type ButtonCardProps = {
  button: ButtonConfig;
  onDelete: () => void;
  onEdit: () => void;
};

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
