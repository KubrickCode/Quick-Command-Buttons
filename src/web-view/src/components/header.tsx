import { Button } from "~/core";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";

export const Header = () => {
  const { saveConfig } = useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-8">
      <h1 className="text-2xl font-bold text-foreground">
        Commands Configuration
      </h1>
      <div className="flex gap-2">
        <Button
          onClick={toggleTheme}
          variant="outline"
          className="border-border hover:bg-accent px-2"
        >
          {isDark ? "☀️" : "🌙"}
        </Button>
        <Button onClick={openForm}>Add</Button>
        <Button
          onClick={saveConfig}
          className="bg-green-600 hover:bg-green-700"
        >
          Apply changes
        </Button>
      </div>
    </div>
  );
};
