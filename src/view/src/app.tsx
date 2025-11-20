import { CommandFormDialog } from "./components/command-form-dialog.tsx";
import { CommandList } from "./components/command-list.tsx";
import { ErrorBoundary } from "./components/error-boundary.tsx";
import { Header } from "./components/header";
import { CommandFormProvider } from "./context/command-form-context.tsx";
import { VscodeCommandProvider } from "./context/vscode-command-context.tsx";
import { Toaster } from "./core/toast";

const App = () => {
  return (
    <ErrorBoundary>
      <VscodeCommandProvider>
        <CommandFormProvider>
          <Toaster position="bottom-right" toastOptions={{ className: "text-sm" }} />
          <div className="min-h-[100vh] bg-background p-6 text-foreground">
            <div className="max-w-4xl mx-auto">
              <Header />
              <CommandList />
              <CommandFormDialog />
            </div>
          </div>
        </CommandFormProvider>
      </VscodeCommandProvider>
    </ErrorBoundary>
  );
};

export default App;
