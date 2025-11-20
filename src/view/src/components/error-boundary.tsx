import type { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary";

import { Button } from "~/core";

type ErrorBoundaryProps = {
  children: ReactNode;
};

const ERROR_MESSAGES = {
  DESCRIPTION: "The configuration UI encountered an error.",
  HEADING: "Something went wrong",
  LOG_PREFIX: "Webview crashed:",
  RELOAD_BUTTON: "Reload Webview",
} as const;

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error(ERROR_MESSAGES.LOG_PREFIX, error, info.componentStack);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

const ErrorFallback = ({ error }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8">
      <h2 className="text-xl font-bold mb-4">{ERROR_MESSAGES.HEADING}</h2>
      <p className="text-muted-foreground mb-4">{ERROR_MESSAGES.DESCRIPTION}</p>
      <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted p-3 rounded max-w-lg overflow-auto">
        {error.message}
      </p>
      <Button onClick={() => window.location.reload()}>{ERROR_MESSAGES.RELOAD_BUTTON}</Button>
    </div>
  );
};
