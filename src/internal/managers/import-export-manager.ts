import * as os from "os";
import * as path from "path";
import { isEqual } from "es-toolkit";
import * as vscode from "vscode";
import { ConfigurationTargetType } from "../../pkg/config-constants";
import { MESSAGES } from "../../shared/constants";
import {
  ButtonConfig,
  ButtonConfigWithOptionalId,
  ConfigurationTarget,
  ExportFormat,
  ExportResult,
  ImportAnalysis,
  ImportConflict,
  ImportPreviewData,
  ImportPreviewResult,
  ImportResult,
  ImportStrategy,
  ShortcutConflict,
} from "../../shared/types";
import {
  ConfigReader,
  ConfigWriter,
  FileSystemOperations,
  ProjectLocalStorage as LocalStorage,
} from "../adapters";
import { safeValidateExportFormat } from "../schemas/export-format.schema";
import { ensureId, ensureIdsInArray, stripId, stripIdsInArray } from "../utils/ensure-id";
import { BackupManager } from "./backup-manager";
import { ConfigManager } from "./config-manager";

const BUTTON_SOURCE = {
  EXISTING: "existing",
  IMPORTED: "imported",
} as const;

const EXPORT_FORMAT_VERSION = "1.0";
const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PREVIEW_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const EXPORT_DIALOG_SAVE_LABEL = "Export Configuration";
const IMPORT_DIALOG_OPEN_LABEL = "Import Configuration";
const IMPORT_DIALOG_TITLE = "Select Configuration File to Import";

export class ImportExportManager {
  private readonly backupManager: BackupManager;

  private constructor(
    private readonly fileSystem: FileSystemOperations,
    private readonly configReader: ConfigReader,
    private readonly configWriter: ConfigWriter,
    private readonly configManager: ConfigManager,
    private readonly localStorage: LocalStorage | undefined,
    extensionContext: vscode.ExtensionContext
  ) {
    this.backupManager = BackupManager.create(fileSystem, extensionContext);
  }

  static create(
    fileSystem: FileSystemOperations,
    configReader: ConfigReader,
    configWriter: ConfigWriter,
    configManager: ConfigManager,
    localStorage: LocalStorage | undefined,
    extensionContext: vscode.ExtensionContext
  ): ImportExportManager {
    return new ImportExportManager(
      fileSystem,
      configReader,
      configWriter,
      configManager,
      localStorage,
      extensionContext
    );
  }

  async confirmImport(
    preview: ImportPreviewData,
    targetScope: ConfigurationTargetType,
    strategy: ImportStrategy,
    currentButtons?: ButtonConfig[]
  ): Promise<ImportResult> {
    try {
      const elapsed = Date.now() - preview.timestamp;
      if (elapsed > PREVIEW_EXPIRY_MS) {
        return {
          conflictsResolved: 0,
          error: MESSAGES.ERROR.importPreviewExpired,
          importedCount: 0,
          success: false,
        };
      }

      const buttonsWithIds = ensureIdsInArray(preview.buttons);
      const existingButtons =
        currentButtons ??
        this.configManager.getButtonsForTarget(
          targetScope as ConfigurationTarget,
          this.configReader
        );

      const backupResult = await this.performBackup(existingButtons, targetScope);
      if (!backupResult.success) {
        return {
          conflictsResolved: 0,
          error: MESSAGES.ERROR.backupFailedAndImportCancelled(backupResult.error ?? "Unknown"),
          importedCount: 0,
          success: false,
        };
      }

      const { conflictsResolved, finalButtons } = this.applyImportStrategy(
        existingButtons,
        buttonsWithIds,
        strategy
      );

      return {
        backupPath: backupResult.backupPath,
        conflictsResolved,
        finalButtons,
        importedCount: preview.buttons.length,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[ImportExportManager] Confirm import failed:", error);
      return { conflictsResolved: 0, error: message, importedCount: 0, success: false };
    }
  }

  detectConflicts(
    existingButtons: ButtonConfig[],
    importedButtons: ButtonConfig[]
  ): ImportConflict[] {
    const analysis = this.analyzeImportChanges(existingButtons, importedButtons);
    return analysis.modified;
  }

  async exportConfiguration(target: ConfigurationTargetType): Promise<ExportResult> {
    try {
      const buttons = this.configManager.getButtonsForTarget(
        target as ConfigurationTarget,
        this.configReader
      );
      const buttonsWithoutIds = stripIdsInArray(buttons);
      const exportData: ExportFormat = {
        buttons: buttonsWithoutIds,
        exportedAt: new Date().toISOString(),
        version: EXPORT_FORMAT_VERSION,
      };

      const defaultFileName = `quick-commands-${target}-${this.getTimestampString()}.json`;
      const sanitizedFileName = this.getFileNameFromPath(defaultFileName);
      const defaultUri = this.getDefaultExportPath(sanitizedFileName);
      const saveUri = await this.fileSystem.showSaveDialog({
        defaultUri,
        filters: {
          JSON: ["json"],
        },
        saveLabel: EXPORT_DIALOG_SAVE_LABEL,
        title: `Export Quick Command Buttons (${target})`,
      });

      if (!saveUri) {
        return {
          success: false,
        };
      }

      const content = JSON.stringify(exportData, null, 2);
      await this.fileSystem.writeFile(saveUri, content);

      return {
        filePath: saveUri.fsPath,
        success: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[ImportExportManager] Export failed:", error);
      return {
        error: message,
        success: false,
      };
    }
  }

  async importConfiguration(
    targetScope: ConfigurationTargetType,
    uri?: vscode.Uri,
    strategy: ImportStrategy = "merge"
  ): Promise<ImportResult> {
    try {
      const { data, error, success } = await this.getAndValidateImportFile(uri);
      if (!success || !data) {
        return { error, importedCount: 0, success: false };
      }

      return await this.executeImport(data, targetScope, strategy);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[ImportExportManager] Import failed:", error);
      return {
        error: message,
        importedCount: 0,
        success: false,
      };
    }
  }

  async previewImport(
    targetScope: ConfigurationTargetType,
    uri?: vscode.Uri,
    currentButtons?: ButtonConfig[]
  ): Promise<ImportPreviewResult> {
    try {
      const fileUri = uri ?? (await this.selectImportFile());
      if (!fileUri) {
        return { success: false };
      }

      const { data, error, success } = await this.getAndValidateImportFile(fileUri);
      if (!success || !data) {
        return { error, success: false };
      }

      const existingButtons =
        currentButtons ??
        this.configManager.getButtonsForTarget(
          targetScope as ConfigurationTarget,
          this.configReader
        );
      const analysis = this.analyzeImportChanges(existingButtons, data.buttons);

      const preview: ImportPreviewData = {
        analysis,
        buttons: data.buttons,
        fileUri: fileUri.fsPath,
        targetScope: targetScope as ConfigurationTarget,
        timestamp: Date.now(),
      };

      return { preview, success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[ImportExportManager] Preview failed:", error);
      return { error: message, success: false };
    }
  }

  validateImportData(content: string): { data?: ExportFormat; error?: string; success: boolean } {
    try {
      const parsed = JSON.parse(content);
      return safeValidateExportFormat(parsed);
    } catch (_error) {
      return {
        error: "Invalid JSON format",
        success: false,
      };
    }
  }

  private analyzeImportChanges(
    existingButtons: ButtonConfig[],
    importedButtons: ButtonConfigWithOptionalId[]
  ): ImportAnalysis {
    const existingByName = new Map(existingButtons.map((btn) => [btn.name, btn]));
    const added: ButtonConfigWithOptionalId[] = [];
    const modified: ImportConflict[] = [];
    const unchanged: ButtonConfigWithOptionalId[] = [];

    for (const importedButton of importedButtons) {
      const existing = existingByName.get(importedButton.name);
      if (!existing) {
        added.push(importedButton);
      } else {
        const existingWithoutId = stripId(existing);
        const importedWithoutId = stripId(importedButton);
        if (isEqual(existingWithoutId, importedWithoutId)) {
          unchanged.push(importedButton);
        } else {
          const importedWithId = { ...importedButton, id: existing.id };
          modified.push({
            existingButton: existing,
            importedButton: ensureId(importedWithId),
          });
        }
      }
    }

    const shortcutConflicts = this.detectShortcutConflicts({ existingButtons, importedButtons });

    return { added, modified, shortcutConflicts, unchanged };
  }

  private applyImportStrategy(
    existingButtons: ButtonConfig[],
    importedButtons: ButtonConfig[],
    strategy: ImportStrategy
  ): { conflictsResolved: number; finalButtons: ButtonConfig[] } {
    if (strategy === "replace") {
      const conflicts = this.detectConflicts(existingButtons, importedButtons);
      return {
        conflictsResolved: conflicts.length,
        finalButtons: importedButtons,
      };
    }

    const conflicts = this.detectConflicts(existingButtons, importedButtons);
    const { buttons, conflictsResolved } = this.mergeButtons(
      existingButtons,
      importedButtons,
      conflicts
    );
    return {
      conflictsResolved,
      finalButtons: buttons,
    };
  }

  private detectShortcutConflicts({
    existingButtons,
    importedButtons,
  }: {
    existingButtons: ButtonConfig[];
    importedButtons: ButtonConfigWithOptionalId[];
  }): ShortcutConflict[] {
    type ButtonSource = (typeof BUTTON_SOURCE)[keyof typeof BUTTON_SOURCE];
    type ButtonWithSource = {
      button: ButtonConfig | ButtonConfigWithOptionalId;
      source: ButtonSource;
    };

    // Key: "path|shortcut" (e.g., "|c" for root level, "Git|c" for inside Git group)
    const shortcutMap = new Map<string, ButtonWithSource[]>();

    const collectShortcuts = (
      buttons: (ButtonConfig | ButtonConfigWithOptionalId)[],
      source: ButtonSource,
      parentPath: string
    ) => {
      for (const button of buttons) {
        if (button.shortcut) {
          const key = `${parentPath}|${button.shortcut.toLowerCase()}`;
          const entries = shortcutMap.get(key) ?? [];
          shortcutMap.set(key, [...entries, { button, source }]);
        }
        if (button.group) {
          collectShortcuts(button.group, source, button.name);
        }
      }
    };

    collectShortcuts(existingButtons, BUTTON_SOURCE.EXISTING, "");
    collectShortcuts(importedButtons, BUTTON_SOURCE.IMPORTED, "");

    return Array.from(shortcutMap.entries())
      .filter(([, buttonsWithSource]) => {
        if (buttonsWithSource.length <= 1) {
          return false;
        }
        // Conflict exists if multiple different buttons share the same shortcut at the same level
        const firstButtonStripped = stripId(buttonsWithSource[0].button);
        return buttonsWithSource.some((b) => !isEqual(stripId(b.button), firstButtonStripped));
      })
      .map(([key, buttonsWithSource]) => ({
        buttons: buttonsWithSource.map((b) => ({
          id: b.button.id,
          name: b.button.name,
          source: b.source,
        })),
        shortcut: key.split("|")[1],
      }));
  }

  private async executeImport(
    data: ExportFormat,
    targetScope: ConfigurationTargetType,
    strategy: ImportStrategy
  ): Promise<ImportResult> {
    const buttonsWithIds = ensureIdsInArray(data.buttons);
    const existingButtons = this.configManager.getButtonsForTarget(
      targetScope as ConfigurationTarget,
      this.configReader
    );

    const backupResult = await this.performBackup(existingButtons, targetScope);
    if (!backupResult.success) {
      return {
        error: MESSAGES.ERROR.backupFailedAndImportCancelled(backupResult.error ?? "Unknown"),
        importedCount: 0,
        success: false,
      };
    }

    const { conflictsResolved, finalButtons } = this.applyImportStrategy(
      existingButtons,
      buttonsWithIds,
      strategy
    );

    await this.writeButtonsToTarget(finalButtons, targetScope);

    return {
      backupPath: backupResult.backupPath,
      conflictsResolved,
      importedCount: data.buttons.length,
      success: true,
    };
  }

  private async getAndValidateImportFile(
    uri?: vscode.Uri
  ): Promise<{ data?: ExportFormat; error?: string; success: boolean }> {
    const fileUri = uri ?? (await this.selectImportFile());
    if (!fileUri) {
      return { success: false };
    }

    const fileStat = await this.fileSystem.stat(fileUri);
    if (fileStat.size > MAX_IMPORT_FILE_SIZE) {
      const errorMessage = `File too large: ${fileStat.size} bytes (max: ${MAX_IMPORT_FILE_SIZE} bytes)`;
      console.error("[ImportExportManager]", errorMessage);
      return { error: errorMessage, success: false };
    }

    const content = await this.fileSystem.readFile(fileUri);
    const validation = this.validateImportData(content);

    if (!validation.success || !validation.data) {
      console.error("[ImportExportManager] Invalid configuration:", validation.error);
      return { error: validation.error, success: false };
    }

    return { data: validation.data, success: true };
  }

  private getDefaultExportPath(fileName: string): vscode.Uri {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (workspaceFolder) {
      return vscode.Uri.joinPath(workspaceFolder.uri, fileName);
    }

    const homeDir = os.homedir();
    return vscode.Uri.file(path.join(homeDir, fileName));
  }

  private getFileNameFromPath(fileName: string): string {
    return path.basename(fileName);
  }

  private getTimestampString(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }

  private mergeButtons(
    existingButtons: ButtonConfig[],
    importedButtons: ButtonConfig[],
    conflicts: ImportConflict[]
  ): { buttons: ButtonConfig[]; conflictsResolved: number } {
    const finalButtonsByName = new Map(existingButtons.map((btn) => [btn.name, btn]));

    for (const importedButton of importedButtons) {
      finalButtonsByName.set(importedButton.name, importedButton);
    }

    return {
      buttons: Array.from(finalButtonsByName.values()),
      conflictsResolved: conflicts.length,
    };
  }

  private async performBackup(
    buttons: ButtonConfig[],
    target: ConfigurationTargetType
  ): Promise<{ backupPath?: string; error?: string; success: boolean }> {
    const backupResult = await this.backupManager.createBackup(
      buttons,
      target as ConfigurationTarget
    );

    if (!backupResult.success) {
      console.error("[ImportExportManager] Backup failed:", backupResult.error);
    }

    return backupResult;
  }

  private async selectImportFile(): Promise<vscode.Uri | undefined> {
    const defaultFileName = "quick-commands-*.json";
    const sanitizedFileName = this.getFileNameFromPath(defaultFileName);
    const defaultUri = this.getDefaultExportPath(sanitizedFileName);

    const uris = await this.fileSystem.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      defaultUri,
      filters: {
        JSON: ["json"],
      },
      openLabel: IMPORT_DIALOG_OPEN_LABEL,
      title: IMPORT_DIALOG_TITLE,
    });

    return uris?.[0];
  }

  private async writeButtonsToTarget(
    buttons: ButtonConfig[],
    target: ConfigurationTarget
  ): Promise<void> {
    if (target === "local" && this.localStorage) {
      await this.localStorage.setButtons(buttons);
      return;
    }

    const vsCodeTarget =
      target === "workspace"
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;

    await this.configWriter.writeButtons(buttons, vsCodeTarget);
  }
}
