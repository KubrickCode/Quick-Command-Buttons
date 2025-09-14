import { CommandList } from "./components/command-list.tsx";
import { CommandFormDialog } from "./components/command-form-dialog.tsx";
import { Header } from "./components/header";
import { VscodeCommandProvider } from "./context/vscode-command-context.tsx";
import { CommandFormProvider } from "./context/command-form-context.tsx";

const App = () => {
  return (
    <VscodeCommandProvider>
      <CommandFormProvider>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <Header />
            <CommandList />
            <CommandFormDialog />
          </div>
        </div>
      </CommandFormProvider>
    </VscodeCommandProvider>
  );
};

export default App;
