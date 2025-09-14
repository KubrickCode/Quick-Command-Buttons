import { Button } from "~/core";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";

export const Header = () => {
  const { saveConfig, openForm } = useVscodeCommand();
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-foreground">
        Quick Command Buttons Configuration
      </h1>
      <div className="space-x-3">
        <Button onClick={openForm}>Add Command</Button>
        <Button
          onClick={saveConfig}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
