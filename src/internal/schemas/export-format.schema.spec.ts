import { ExportFormat, ButtonConfig } from "../../shared/types";
import { validateExportFormat, safeValidateExportFormat } from "./export-format.schema";

describe("exportFormatSchema", () => {
  const validButton: ButtonConfig = {
    command: "npm test",
    id: "btn-1",
    name: "Run Tests",
  };

  const validExportData: ExportFormat = {
    buttons: [validButton],
    exportedAt: "2025-11-24T00:00:00.000Z",
    version: "1.0",
  };

  describe("validateExportFormat", () => {
    it("should validate correct export format", () => {
      const result = validateExportFormat(validExportData);

      expect(result).toEqual(validExportData);
    });

    it("should accept data with only buttons (metadata optional)", () => {
      const minimalData = {
        buttons: [validButton],
      };

      const result = validateExportFormat(minimalData);
      expect(result.buttons).toEqual([validButton]);
    });

    it("should validate buttons with all optional properties", () => {
      const complexButton: ButtonConfig = {
        color: "#FF0000",
        command: "npm run dev",
        id: "btn-complex",
        insertOnly: false,
        name: "Complex Button",
        shortcut: "d",
        terminalName: "Dev Server",
        useVsCodeApi: false,
      };

      const data: ExportFormat = {
        ...validExportData,
        buttons: [complexButton],
      };

      const result = validateExportFormat(data);
      expect(result.buttons[0]).toEqual(complexButton);
    });

    it("should validate nested button groups", () => {
      const nestedButton: ButtonConfig = {
        group: [
          {
            command: "sub-cmd-1",
            id: "sub-1",
            name: "Sub Command 1",
          },
          {
            // Testing nested group - valid now (no command with group)
            group: [
              {
                command: "nested-cmd",
                id: "nested-1",
                name: "Nested Command",
              },
            ],
            id: "sub-2",
            name: "Sub Command 2",
          },
        ],
        id: "group-1",
        name: "Command Group",
      };

      const data: ExportFormat = {
        ...validExportData,
        buttons: [nestedButton],
      };

      const result = validateExportFormat(data);
      expect(result.buttons[0].group).toHaveLength(2);
      expect(result.buttons[0].group?.[1].group).toHaveLength(1);
    });

    it("should throw on missing required button fields", () => {
      const invalidData = {
        ...validExportData,
        buttons: [{ name: "Incomplete" }],
      };

      expect(() => validateExportFormat(invalidData)).toThrow();
    });

    it("should throw on empty button name", () => {
      const invalidData = {
        ...validExportData,
        buttons: [{ command: "test", id: "btn-1", name: "" }],
      };

      expect(() => validateExportFormat(invalidData)).toThrow();
    });

    it("should throw on missing buttons array", () => {
      const invalidData = {
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      expect(() => validateExportFormat(invalidData)).toThrow();
    });

    it("should throw on non-array buttons", () => {
      const invalidData = {
        ...validExportData,
        buttons: "not an array",
      };

      expect(() => validateExportFormat(invalidData)).toThrow();
    });
  });

  describe("safeValidateExportFormat", () => {
    it("should return success for valid data", () => {
      const result = safeValidateExportFormat(validExportData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validExportData);
      expect(result.error).toBeUndefined();
    });

    it("should return success for minimal data (only buttons)", () => {
      const minimalData = {
        buttons: [validButton],
      };

      const result = safeValidateExportFormat(minimalData);

      expect(result.success).toBe(true);
      expect(result.data?.buttons).toEqual([validButton]);
    });

    it("should return error for invalid data", () => {
      const invalidData = {
        buttons: "not an array",
      };

      const result = safeValidateExportFormat(invalidData);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error).toContain("buttons");
    });

    it("should handle multiple validation errors", () => {
      const invalidData = {
        buttons: [{ id: "incomplete" }],
        exportedAt: "2025-11-24T00:00:00.000Z",
      };

      const result = safeValidateExportFormat(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should validate empty buttons array", () => {
      const emptyButtonsData: ExportFormat = {
        ...validExportData,
        buttons: [],
      };

      const result = safeValidateExportFormat(emptyButtonsData);

      expect(result.success).toBe(true);
      expect(result.data?.buttons).toHaveLength(0);
    });

    it("should accept future version strings", () => {
      const futureVersionData = {
        ...validExportData,
        version: "2.0",
      };

      const result = safeValidateExportFormat(futureVersionData);

      expect(result.success).toBe(true);
      expect(result.data?.version).toBe("2.0");
    });

    it("should handle null input", () => {
      const result = safeValidateExportFormat(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle undefined input", () => {
      const result = safeValidateExportFormat(undefined);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle non-object input", () => {
      const result = safeValidateExportFormat("invalid string");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
