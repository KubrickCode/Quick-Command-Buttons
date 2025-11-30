import { useCallback } from "react";

import { MESSAGES, TOAST_DURATION } from "../../../shared/constants";
import { toast } from "../core/toast";
import { vscodeApi } from "../core/vscode-api";
import type { ButtonConfig } from "../types";

const COMMUNICATION_TIMEOUT = 5000;
const FILE_OPERATION_TIMEOUT = 300000; // 5 minutes for file dialogs

type MessageData =
  | ButtonConfig[]
  | { name?: string }
  | { preview?: unknown; strategy?: string; target?: string }
  | { setName?: string | null }
  | { buttons?: ButtonConfig[]; name: string; sourceSetId?: string }
  | { currentName: string; newName: string };

type PendingRequest<T = void> = {
  reject: (error: Error) => void;
  resolve: (data: T) => void;
  timeout: NodeJS.Timeout;
};

type MessageOptions = {
  timeout?: number;
};

// Singleton: shared across all hook instances
const pendingRequests = new Map<string, PendingRequest<unknown>>();

export const useWebviewCommunication = () => {
  const generateRequestId = useCallback((messageType: string): string => {
    return `${messageType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const sendMessage = useCallback(
    <T = void,>(
      messageType:
        | "confirmImport"
        | "createButtonSet"
        | "deleteButtonSet"
        | "exportConfiguration"
        | "getConfig"
        | "importConfiguration"
        | "previewImport"
        | "renameButtonSet"
        | "saveAsButtonSet"
        | "setActiveSet"
        | "setConfig"
        | "setConfigurationTarget",
      messageData?: MessageData,
      options?: MessageOptions
    ): Promise<T> => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId(messageType);

        // Use longer timeout for file operations (export/import/preview)
        const isFileOperation =
          messageType === "exportConfiguration" ||
          messageType === "importConfiguration" ||
          messageType === "previewImport" ||
          messageType === "confirmImport";
        const timeoutDuration =
          options?.timeout ?? (isFileOperation ? FILE_OPERATION_TIMEOUT : COMMUNICATION_TIMEOUT);

        const timeout = setTimeout(() => {
          pendingRequests.delete(requestId);
          const errorMsg = MESSAGES.ERROR.communicationTimeout;
          console.error(errorMsg);
          toast.error(errorMsg, { duration: TOAST_DURATION.TIMEOUT });
          reject(new Error(errorMsg));
        }, timeoutDuration);

        pendingRequests.set(requestId, {
          reject,
          resolve: resolve as (data: unknown) => void,
          timeout,
        });

        const data = messageData;

        vscodeApi.postMessage({
          data,
          requestId,
          type: messageType,
        });
      });
    },
    [generateRequestId]
  );

  const resolveRequest = useCallback((requestId?: string, responseData?: unknown) => {
    if (!requestId) return;

    const pending = pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(responseData);
      pendingRequests.delete(requestId);
    }
  }, []);

  const rejectRequest = useCallback((requestId?: string, error?: string) => {
    if (!requestId) return;

    const pending = pendingRequests.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(error || MESSAGES.ERROR.unknownError));
      pendingRequests.delete(requestId);
    }
  }, []);

  const clearAllRequests = useCallback(() => {
    pendingRequests.forEach(({ timeout }) => clearTimeout(timeout));
    pendingRequests.clear();
  }, []);

  return {
    clearAllRequests,
    rejectRequest,
    resolveRequest,
    sendMessage,
  };
};
