// Game Info Types
export interface GameInfo {
  path: string;
  version: string | null;
  is_valid: boolean;
  has_translation: boolean;
  translation_version: string | null;
}

// Translation Types
export interface TranslationVersion {
  version: string;
  release_date: string;
  download_url: string;
  file_size: number;
  changelog: string[];
}

export interface TranslationPack {
  latest_version: string;
  versions: TranslationVersion[];
  github_repo: string;
}

export interface TranslationInfo {
  version: string;
  installed_date: string;
  files: string[];
}

// App Config Types
export interface AppConfig {
  game_path: string | null;
  auto_update: boolean;
  auto_start: boolean;
  github_repo: string;
  check_update_on_startup: boolean;
  language: string;
}

// App Update Types
export interface AppUpdateInfo {
  version: string;
  current_version: string;
  release_date: string;
  download_url: string;
  file_size: number;
  changelog: string[];
}

// Progress Event Types
export interface ProgressEvent {
  message: string;
  progress: number;
}

// System Types
export interface DiskSpace {
  free: number;
  total: number;
}
