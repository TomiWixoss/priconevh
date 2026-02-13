import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type {
  GameInfo,
  TranslationPack,
  TranslationVersion,
  TranslationInfo,
  AppConfig,
  AppUpdateInfo,
  ProgressEvent,
  DiskSpace,
} from "@/types";

// Game API
export const gameApi = {
  autoDetect: () => invoke<string | null>("auto_detect_game"),
  
  selectDirectory: () => invoke<string | null>("select_game_directory"),
  
  validatePath: (path: string) => invoke<GameInfo>("validate_game_path", { path }),
  
  getInfo: (path: string) => invoke<GameInfo>("get_game_info", { path }),
};

// Translation API
export const translationApi = {
  getAvailable: () => invoke<TranslationPack>("get_available_translations"),
  
  checkUpdates: (currentVersion: string) =>
    invoke<TranslationVersion | null>("check_translation_updates", { currentVersion }),
  
  install: (gamePath: string, version: TranslationVersion) =>
    invoke<void>("install_translation", { gamePath, version }),
  
  update: (gamePath: string, newVersion: TranslationVersion) =>
    invoke<void>("update_translation", { gamePath, newVersion }),
  
  uninstall: (gamePath: string) =>
    invoke<void>("uninstall_translation", { gamePath }),
  
  getInfo: (gamePath: string) =>
    invoke<TranslationInfo | null>("get_translation_info", { gamePath }),
  
  onProgress: (callback: (event: ProgressEvent) => void) =>
    listen<[string, number]>("translation-progress", (event) => {
      callback({
        message: event.payload[0],
        progress: event.payload[1],
      });
    }),
};

// Config API
export const configApi = {
  load: () => invoke<AppConfig>("load_config"),
  
  save: (config: AppConfig) => invoke<void>("save_config", { config }),
  
  updateGamePath: (path: string) => invoke<void>("update_game_path", { path }),
  
  toggleAutoUpdate: (enabled: boolean) =>
    invoke<void>("toggle_auto_update", { enabled }),
  
  toggleAutoStart: (enabled: boolean) =>
    invoke<void>("toggle_auto_start", { enabled }),
  
  setGithubRepo: (repo: string) => invoke<void>("set_github_repo", { repo }),
};

// System API
export const systemApi = {
  getDiskSpace: (path: string) =>
    invoke<[number, number]>("get_disk_space", { path }).then(
      ([free, total]) => ({ free, total } as DiskSpace)
    ),
  
  checkDiskSpace: (path: string, requiredBytes: number) =>
    invoke<boolean>("check_disk_space", { path, requiredBytes }),
  
  getDirectorySize: (path: string) =>
    invoke<number>("get_directory_size", { path }),
  
  openDirectory: (path: string) => invoke<void>("open_directory", { path }),
  
  createBackup: (sourcePath: string, backupName: string) =>
    invoke<string>("create_backup", { sourcePath, backupName }),
};

// Updater API
export const updaterApi = {
  checkUpdate: () => invoke<AppUpdateInfo | null>("check_app_update"),
  
  downloadAndInstall: (updateInfo: AppUpdateInfo) => 
    invoke<void>("download_and_install_update", { updateInfo }),
  
  onProgress: (callback: (event: ProgressEvent) => void) =>
    listen<[string, number]>("updater-progress", (event) => {
      callback({
        message: event.payload[0],
        progress: event.payload[1],
      });
    }),
};

// Helper functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
