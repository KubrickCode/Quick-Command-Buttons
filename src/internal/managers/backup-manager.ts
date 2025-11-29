import * as path from "path";
import * as vscode from "vscode";
import { ButtonConfig, ConfigurationTarget, ExportFormat } from "../../shared/types";
import { FileSystemOperations } from "../adapters";
import { stripIdsInArray } from "../utils/ensure-id";

const EXPORT_FORMAT_VERSION = "1.0";
const BACKUP_DIRECTORY = ".backup";
const BACKUP_FILENAME_PREFIX = "backup";

export type BackupResult = {
  backupPath?: string;
  error?: string;
  success: boolean;
};

export class BackupManager {
  private constructor(
    private readonly fileSystem: FileSystemOperations,
    private readonly extensionContext: vscode.ExtensionContext
  ) {}

  static create(
    fileSystem: FileSystemOperations,
    extensionContext: vscode.ExtensionContext
  ): BackupManager {
    return new BackupManager(fileSystem, extensionContext);
  }

  async createBackup(buttons: ButtonConfig[], target: ConfigurationTarget): Promise<BackupResult> {
    try {
      const backupDirPath = path.join(
        this.extensionContext.globalStorageUri.fsPath,
        BACKUP_DIRECTORY
      );
      const backupDirUri = vscode.Uri.file(backupDirPath);

      const dirExists = await this.fileSystem.exists(backupDirUri);
      if (!dirExists) {
        await this.fileSystem.createDirectory(backupDirUri);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `${BACKUP_FILENAME_PREFIX}-${target}-${timestamp}.json`;
      const backupPath = path.join(backupDirPath, filename);
      const backupUri = vscode.Uri.file(backupPath);

      const buttonsWithoutIds = stripIdsInArray(buttons);
      const backupData: ExportFormat = {
        buttons: buttonsWithoutIds,
        configurationTarget: target,
        exportedAt: new Date().toISOString(),
        version: EXPORT_FORMAT_VERSION,
      };

      const content = JSON.stringify(backupData, null, 2);
      await this.fileSystem.writeFile(backupUri, content);

      return {
        backupPath,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[BackupManager] Failed to create backup:", error);
      return {
        error: errorMessage,
        success: false,
      };
    }
  }
}
