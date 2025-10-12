import { CommandFormDialog } from "./components/command-form-dialog.tsx";
import { CommandList } from "./components/command-list.tsx";
import { Header } from "./components/header";
import { CommandFormProvider } from "./context/command-form-context.tsx";
import { VscodeCommandProvider } from "./context/vscode-command-context.tsx";

const App = () => {
  return (
    <VscodeCommandProvider>
      <CommandFormProvider>
        <div className="min-h-[100vh] bg-background p-6 text-foreground">
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
