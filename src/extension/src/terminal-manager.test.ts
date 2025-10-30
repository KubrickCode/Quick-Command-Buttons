import * as vscode from "vscode";
import {
  shouldCreateNewTerminal,
  determineTerminalName,
  TerminalManager,
} from "./terminal-manager";

describe("terminal-manager", () => {
  describe("shouldCreateNewTerminal", () => {
    it("should return true when terminal is undefined", () => {
      const result = shouldCreateNewTerminal(undefined);
      expect(result).toBe(true);
    });

    it("should return true when terminal has exit status", () => {
      const mockTerminal = {
        exitStatus: { code: 0 },
      } as any;

      const result = shouldCreateNewTerminal(mockTerminal);
      expect(result).toBe(true);
    });

    it("should return false when terminal exists and has no exit status", () => {
      const mockTerminal = {
        exitStatus: undefined,
      } as any;

      const result = shouldCreateNewTerminal(mockTerminal);
      expect(result).toBe(false);
    });
  });

  describe("determineTerminalName", () => {
    it("should return custom terminal name when provided", () => {
      const result = determineTerminalName("CustomTerminal", "npm test");
      expect(result).toBe("CustomTerminal");
    });

    it("should return first word of command when no custom name", () => {
      const result = determineTerminalName(undefined, "npm test --verbose");
      expect(result).toBe("npm");
    });

    it("should return 'Terminal' when command is empty", () => {
      const result = determineTerminalName(undefined, "");
      expect(result).toBe("Terminal");
    });

    it("should return 'Terminal' when command contains only spaces", () => {
      const result = determineTerminalName(undefined, "   ");
      expect(result).toBe("Terminal");
    });

    it("should handle single word commands", () => {
      const result = determineTerminalName(undefined, "ls");
      expect(result).toBe("ls");
    });
  });

  describe("TerminalManager", () => {
    let manager: TerminalManager;
    let mockTerminal: vscode.Terminal;

    beforeEach(() => {
      manager = TerminalManager.create();
      mockTerminal = {
        dispose: jest.fn(),
        exitStatus: undefined,
        sendText: jest.fn(),
        show: jest.fn(),
      } as any;

      jest.spyOn(vscode.window, "createTerminal").mockReturnValue(mockTerminal);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create separate terminals when customTerminalName is set", () => {
      manager.executeCommand("npm start", false, "build");
      manager.executeCommand("npm test", false, "build");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(1, "build");
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(2, "build");
    });

    it("should create new terminal every time when customTerminalName is set", () => {
      manager.executeCommand("npm start", false, "build");
      manager.executeCommand("npm start", false, "build");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
    });

    it("should reuse terminal for same command without customTerminalName", () => {
      manager.executeCommand("npm start", false);
      manager.executeCommand("npm start", false);

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(1);
    });

    it("should create separate terminals for different commands without customTerminalName", () => {
      manager.executeCommand("npm start", false);
      manager.executeCommand("npm test", false);

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(1, "npm");
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(2, "npm");
    });
  });
});
