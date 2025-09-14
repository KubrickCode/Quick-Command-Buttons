import { CommandList } from "./components/command-list.tsx";
import { CommandFormDialog } from "./components/command-form-dialog.tsx";
import { Header } from "./components/header";
import { VscodeCommandProvider } from "./context/vscode-command-context.tsx";

const App = () => {
  return (
    <VscodeCommandProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Header />
          <CommandList />
          <CommandFormDialog />
        </div>
      </div>
    </VscodeCommandProvider>
  );
};

export default App;
