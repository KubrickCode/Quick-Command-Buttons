import { type ReactNode, useState } from "react";
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import { Button } from "~/core";

type ErrorBoundaryProps = {
  children: ReactNode;
};

const ERROR_MESSAGES = {
  LOG_PREFIX: "Webview crashed:",
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

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation();

  const handleReset = () => {
    // Clear test error trigger flag before resetting
    if (import.meta.env.DEV) {
      window.__TEST_ERROR_TRIGGER__ = false;
    }
    resetErrorBoundary();
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen p-8"
      data-testid="error-boundary-fallback"
    >
      <h2 className="text-xl font-bold mb-4">{t("errorBoundary.title")}</h2>
      <p className="text-muted-foreground mb-4">{t("errorBoundary.description")}</p>
      <p
        className="text-sm text-muted-foreground mb-6 font-mono bg-muted p-3 rounded max-w-lg overflow-auto"
        data-testid="error-message"
      >
        {error.message}
      </p>
      <Button data-testid="error-boundary-reset" onClick={handleReset}>
        {t("errorBoundary.reload")}
      </Button>
    </div>
  );
};

/**
 * Test component that throws an error when triggered.
 * Only available in development mode for E2E testing.
 */
export const TestErrorTrigger = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  // Check global trigger flag (set from E2E tests)
  if (window.__TEST_ERROR_TRIGGER__ || shouldThrow) {
    throw new Error("Test error triggered for E2E testing");
  }

  return (
    <button
      className="fixed bottom-4 left-4 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded opacity-50 hover:opacity-100 z-50"
      data-testid="test-error-trigger"
      onClick={() => setShouldThrow(true)}
    >
      Trigger Error (DEV)
    </button>
  );
};

// Window type extension for test error trigger
type WindowWithTestError = Window & { __TEST_ERROR_TRIGGER__?: boolean };

declare const window: WindowWithTestError;
