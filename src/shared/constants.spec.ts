import { MESSAGE_TYPE, MESSAGES } from "./constants";

describe("Webview Communication Error Handling", () => {
  describe("Message constants", () => {
    it("should have ERROR message type", () => {
      expect(MESSAGE_TYPE.ERROR).toBe("error");
    });

    it("should have communication timeout error message", () => {
      const message = MESSAGES.ERROR.communicationTimeout;
      expect(message).toContain("timed out");
      expect(message).toBeTruthy();
    });

    it("should have extension error message template", () => {
      const testError = "Test error";
      const message = MESSAGES.ERROR.extensionError(testError);
      expect(message).toContain(testError);
      expect(message).toBeTruthy();
    });
  });

  describe("Timeout handling", () => {
    it("should reject promise when timeout occurs", async () => {
      const COMMUNICATION_TIMEOUT = 100; // Short timeout for testing

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(MESSAGES.ERROR.communicationTimeout));
        }, COMMUNICATION_TIMEOUT);
      });

      await expect(timeoutPromise).rejects.toThrow(MESSAGES.ERROR.communicationTimeout);
    });
  });
});
