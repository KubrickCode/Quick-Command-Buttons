import { useRef, useCallback } from "react";

import { MESSAGES } from "../../../shared/constants";
import { vscodeApi } from "../core/vscode-api";
import type { ButtonConfig } from "../types";

const COMMUNICATION_TIMEOUT = 5000;

type MessageData = ButtonConfig[] | { target: string };

type PendingRequest = {
  resolve: () => void;
  timeout: NodeJS.Timeout;
};

export const useWebviewCommunication = () => {
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());

  const generateRequestId = useCallback((messageType: string): string => {
    return `${messageType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const sendMessage = useCallback(
    (
      messageType: "getConfig" | "setConfig" | "setConfigurationTarget",
      messageData?: MessageData
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId(messageType);

        const timeout = setTimeout(() => {
          pendingRequestsRef.current.delete(requestId);
          const errorMsg = MESSAGES.ERROR.communicationTimeout;
          console.error(errorMsg);
          reject(new Error(errorMsg));
        }, COMMUNICATION_TIMEOUT);

        pendingRequestsRef.current.set(requestId, { resolve, timeout });

        const isButtonConfigArray = Array.isArray(messageData);
        const data = isButtonConfigArray ? messageData : undefined;
        const target = !isButtonConfigArray && messageData ? messageData.target : undefined;

        vscodeApi.postMessage({
          data,
          requestId,
          target,
          type: messageType,
        });
      });
    },
    [generateRequestId]
  );

  const resolveRequest = useCallback((requestId?: string) => {
    if (!requestId) return;

    const pending = pendingRequestsRef.current.get(requestId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve();
      pendingRequestsRef.current.delete(requestId);
    }
  }, []);

  const clearAllRequests = useCallback(() => {
    pendingRequestsRef.current.forEach(({ timeout }) => clearTimeout(timeout));
    pendingRequestsRef.current.clear();
  }, []);

  return {
    clearAllRequests,
    resolveRequest,
    sendMessage,
  };
};
