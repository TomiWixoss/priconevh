use crate::models::{GameInfo, TranslationVersion};
use crate::services::{DownloadService, FileService, GitHubService};
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TranslationInfo {
    pub version: String,
    pub installed_date: String,
    pub files: Vec<String>,
}

pub struct TranslationService {
    github_service: GitHubService,
    download_service: DownloadService,
}

impl TranslationService {
    pub fn new(github_repo: String) -> Self {
        Self {
            github_service: GitHubService::new(github_repo),
            download_service: DownloadService::new(),
        }
    }

    /// Cài đặt bản việt hóa
    pub async fn install_translation<F>(
        &self,
        game_info: &GameInfo,
        version: &TranslationVersion,
        mut progress_callback: F,
    ) -> Result<(), String>
    where
        F: FnMut(&str, f32) + Send + 'static,
    {
        progress_callback("Đang chuẩn bị...", 0.0);

        // Tạo thư mục temp
        let temp_dir = std::env::temp_dir().join("priconevh_temp");
        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to create temp directory: {}", e))?;

        // Download file
        progress_callback("Đang tải xuống bản việt hóa...", 10.0);
        let zip_path = temp_dir.join(format!("translation_{}.zip", version.version));
        
        self.download_service
            .download_file(
                &version.download_url,
                zip_path.clone(),
                |downloaded, total| {
                    if total > 0 {
                        let percent = 10.0 + (downloaded as f32 / total as f32) * 40.0;
                        progress_callback("Đang tải xuống...", percent);
                    }
                },
            )
            .await?;

        // Giải nén
        progress_callback("Đang giải nén...", 50.0);
        let extract_dir = temp_dir.join("extracted");
        FileService::extract_zip(&zip_path, &extract_dir)?;

        // Backup files cũ nếu có
        progress_callback("Đang sao lưu dữ liệu cũ...", 60.0);
        if game_info.has_translation {
            self.backup_old_translation(&game_info.path)?;
        }

        // Xóa files cũ
        progress_callback("Đang xóa dữ liệu cũ...", 70.0);
        self.remove_old_translation(&game_info.path)?;

        // Copy files mới
        progress_callback("Đang cài đặt bản việt hóa...", 80.0);
        self.copy_translation_files(&extract_dir, &game_info.path)?;

        // Tạo file thông tin
        progress_callback("Đang hoàn tất...", 90.0);
        self.create_translation_info(&game_info.path, &version.version)?;

        // Dọn dẹp
        progress_callback("Đang dọn dẹp...", 95.0);
        FileService::remove_path(&temp_dir)?;

        progress_callback("Hoàn thành!", 100.0);
        Ok(())
    }

    /// Cập nhật bản việt hóa
    pub async fn update_translation<F>(
        &self,
        game_info: &GameInfo,
        new_version: &TranslationVersion,
        progress_callback: F,
    ) -> Result<(), String>
    where
        F: FnMut(&str, f32) + Send + 'static,
    {
        // Cập nhật giống như cài đặt mới
        self.install_translation(game_info, new_version, progress_callback).await
    }

    /// Gỡ bỏ bản việt hóa
    pub fn uninstall_translation(&self, game_path: &Path) -> Result<(), String> {
        // Backup trước khi gỡ
        self.backup_old_translation(game_path)?;

        // Xóa files việt hóa
        self.remove_old_translation(game_path)?;

        // Xóa file thông tin
        let info_file = game_path.join("translation_info.json");
        if info_file.exists() {
            FileService::remove_path(&info_file)?;
        }

        Ok(())
    }

    /// Kiểm tra cập nhật
    pub async fn check_for_updates(&self, current_version: &str) -> Result<Option<TranslationVersion>, String> {
        self.github_service.check_for_updates(current_version).await
    }

    /// Backup bản việt hóa cũ
    fn backup_old_translation(&self, game_path: &Path) -> Result<(), String> {
        let translation_dirs = vec!["localization", "translations", "data"];

        for dir_name in translation_dirs {
            let dir_path = game_path.join(dir_name);
            if dir_path.exists() {
                FileService::create_backup(&dir_path, dir_name)?;
            }
        }

        Ok(())
    }

    /// Xóa bản việt hóa cũ
    fn remove_old_translation(&self, game_path: &Path) -> Result<(), String> {
        let translation_dirs = vec!["localization", "translations"];
        let translation_files = vec!["translation.dat", "strings.json"];

        // Xóa thư mục
        for dir_name in translation_dirs {
            let dir_path = game_path.join(dir_name);
            if dir_path.exists() {
                FileService::remove_path(&dir_path)?;
            }
        }

        // Xóa files
        for file_name in translation_files {
            let file_path = game_path.join(file_name);
            if file_path.exists() {
                FileService::remove_path(&file_path)?;
            }
        }

        Ok(())
    }

    /// Copy files việt hóa vào game
    fn copy_translation_files(&self, source: &Path, game_path: &Path) -> Result<(), String> {
        // Tìm thư mục chứa files việt hóa trong extracted folder
        let translation_root = if source.join("localization").exists() {
            source.to_path_buf()
        } else {
            // Tìm trong các thư mục con
            for entry in std::fs::read_dir(source)
                .map_err(|e| format!("Failed to read extracted directory: {}", e))? 
            {
                let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
                let path = entry.path();
                if path.is_dir() && path.join("localization").exists() {
                    return self.copy_translation_files(&path, game_path);
                }
            }
            source.to_path_buf()
        };

        // Copy tất cả files và thư mục
        for entry in std::fs::read_dir(&translation_root)
            .map_err(|e| format!("Failed to read translation directory: {}", e))? 
        {
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let source_path = entry.path();
            let dest_path = game_path.join(entry.file_name());

            if source_path.is_dir() {
                FileService::copy_dir_recursive(&source_path, &dest_path)?;
            } else {
                std::fs::copy(&source_path, &dest_path)
                    .map_err(|e| format!("Failed to copy file: {}", e))?;
            }
        }

        Ok(())
    }

    /// Tạo file thông tin việt hóa
    fn create_translation_info(&self, game_path: &Path, version: &str) -> Result<(), String> {
        let info = TranslationInfo {
            version: version.to_string(),
            installed_date: chrono::Utc::now().to_rfc3339(),
            files: vec![
                "localization".to_string(),
                "translations".to_string(),
            ],
        };

        let info_path = game_path.join("translation_info.json");
        let content = serde_json::to_string_pretty(&info)
            .map_err(|e| format!("Failed to serialize translation info: {}", e))?;

        std::fs::write(info_path, content)
            .map_err(|e| format!("Failed to write translation info: {}", e))?;

        Ok(())
    }

    /// Lấy thông tin việt hóa hiện tại
    pub fn get_current_translation_info(&self, game_path: &Path) -> Option<TranslationInfo> {
        let info_path = game_path.join("translation_info.json");
        if !info_path.exists() {
            return None;
        }

        let content = std::fs::read_to_string(info_path).ok()?;
        serde_json::from_str(&content).ok()
    }
}
