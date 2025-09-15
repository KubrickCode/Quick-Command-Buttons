import { shouldCreateNewTerminal, determineTerminalName } from "./terminal-manager";

describe("terminal-manager", () => {
  describe("shouldCreateNewTerminal", () => {
    it("should return true when terminal is undefined", () => {
      const result = shouldCreateNewTerminal(undefined);
      expect(result).toBe(true);
    });

    it("should return true when terminal has exit status", () => {
      const mockTerminal = {
        exitStatus: { code: 0 }
      } as any;

      const result = shouldCreateNewTerminal(mockTerminal);
      expect(result).toBe(true);
    });

    it("should return false when terminal exists and has no exit status", () => {
      const mockTerminal = {
        exitStatus: undefined
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
});