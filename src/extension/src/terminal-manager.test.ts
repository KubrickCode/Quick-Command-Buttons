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

    it("should create separate terminals for different buttonNames with same command", () => {
      manager.executeCommand("npm start", false, "build", "Button A");
      manager.executeCommand("npm start", false, "build", "Button B");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(1, "build");
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(2, "build");
    });

    it("should reuse terminal for same button configuration", () => {
      manager.executeCommand("npm start", false, "build", "Button A");
      manager.executeCommand("npm start", false, "build", "Button A");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(1);
    });

    it("should create separate terminals for same command with different terminalNames", () => {
      manager.executeCommand("just test", false, "", "just test");
      manager.executeCommand("just test", false, undefined, "just test");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(1, "just");
      expect(vscode.window.createTerminal).toHaveBeenNthCalledWith(2, "just");
    });

    it("should create separate terminals for executeAll group with same command", () => {
      manager.executeCommand("just test", false, "", "just test 1");
      manager.executeCommand("just test", false, undefined, "just test 2");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(2);
    });

    it("should reuse terminal when same button is clicked again", () => {
      manager.executeCommand("npm test", false, undefined, "Test Button");
      manager.executeCommand("npm test", false, undefined, "Test Button");

      expect(vscode.window.createTerminal).toHaveBeenCalledTimes(1);
    });
  });
});
