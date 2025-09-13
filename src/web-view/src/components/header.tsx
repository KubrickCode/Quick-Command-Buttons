import { Button } from "~/core";

interface HeaderProps {
  onAddButton: () => void;
  onSaveConfig: () => void;
}

export const Header = ({ onAddButton, onSaveConfig }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-foreground">
        Quick Command Buttons Configuration
      </h1>
      <div className="space-x-3">
        <Button onClick={onAddButton}>Add Command</Button>
        <Button
          onClick={onSaveConfig}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
