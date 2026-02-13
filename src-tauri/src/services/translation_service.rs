use crate::models::{GameInfo, TranslationVersion};
use crate::services::{DownloadService, FileService, GitHubService};
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TranslationInfo {
    pub version: String,
    pub installed_date: String,
    pub files: Vec<String>,
}

pub struct TranslationService {
    pub github_service: GitHubService,
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
        progress_callback: F,
    ) -> Result<(), String>
    where
        F: FnMut(&str, f32) + Send + 'static,
    {
        use std::sync::{Arc, Mutex};
        
        let progress = Arc::new(Mutex::new(progress_callback));
        
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang chuẩn bị...", 0.0);
        }

        // Tạo thư mục temp
        let temp_dir = std::env::temp_dir().join("priconevh_temp");
        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to create temp directory: {}", e))?;

        // Download file
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang tải xuống bản việt hóa...", 10.0);
        }
        
        let zip_path = temp_dir.join(format!("translation_{}.zip", version.version));
        
        {
            let progress = progress.clone();
            self.download_service
                .download_file(
                    &version.download_url,
                    zip_path.clone(),
                    move |downloaded, total| {
                        if total > 0 {
                            let percent = 10.0 + (downloaded as f32 / total as f32) * 40.0;
                            progress.lock().unwrap()("Đang tải xuống...", percent);
                        }
                    },
                )
                .await?;
        }

        // Giải nén
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang giải nén...", 50.0);
        }
        let extract_dir = temp_dir.join("extracted");
        FileService::extract_zip(&zip_path, &extract_dir)?;

        // Backup files cũ nếu có
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang sao lưu dữ liệu cũ...", 60.0);
        }
        if game_info.has_translation {
            self.backup_old_translation(&game_info.path)?;
        }

        // Xóa files cũ
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang xóa dữ liệu cũ...", 70.0);
        }
        self.remove_old_translation(&game_info.path)?;

        // Copy files mới
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang cài đặt bản việt hóa...", 80.0);
        }
        self.copy_translation_files(&extract_dir, &game_info.path)?;

        // Tạo file thông tin
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang hoàn tất...", 90.0);
        }
        self.create_translation_info(&game_info.path, &version.version)?;

        // Dọn dẹp
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang dọn dẹp...", 95.0);
        }
        FileService::remove_path(&temp_dir)?;

        {
            let progress = progress.clone();
            progress.lock().unwrap()("Hoàn thành!", 100.0);
        }
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

    /// Backup bản việt hóa cũ (CHỈ backup files việt hóa, KHÔNG backup toàn bộ game)
    fn backup_old_translation(&self, game_path: &Path) -> Result<(), String> {
        // Chỉ backup các thư mục/file liên quan đến việt hóa BepInEx
        let translation_items = vec![
            ("BepInEx", true),  // (path, is_directory)
            ("dotnet", true),
            (".doorstop_version", false),
            ("doorstop_config.ini", false),
            ("dxgi.dll", false),
            ("translation_info.json", false),
        ];

        let backup_dir = game_path.join("translation_backup");
        
        // Xóa backup cũ nếu có
        if backup_dir.exists() {
            FileService::remove_path(&backup_dir)?;
        }
        
        std::fs::create_dir_all(&backup_dir)
            .map_err(|e| format!("Failed to create backup directory: {}", e))?;

        for (item_name, is_dir) in translation_items {
            let item_path = game_path.join(item_name);
            if item_path.exists() {
                let backup_path = backup_dir.join(item_name);
                
                if is_dir {
                    FileService::copy_dir_recursive(&item_path, &backup_path)?;
                } else {
                    std::fs::copy(&item_path, &backup_path)
                        .map_err(|e| format!("Failed to backup file {}: {}", item_name, e))?;
                }
            }
        }

        Ok(())
    }

    /// Xóa bản việt hóa cũ
    fn remove_old_translation(&self, game_path: &Path) -> Result<(), String> {
        let translation_dirs = vec!["BepInEx", "dotnet"];
        let translation_files = vec![".doorstop_version", "doorstop_config.ini", "dxgi.dll"];

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
        // Cấu trúc: PriconneTL_YYYYMMDD-VH/BepInEx/...
        let translation_root = if source.join("BepInEx").exists() {
            source.to_path_buf()
        } else {
            // Tìm trong các thư mục con (có thể có thư mục wrapper)
            for entry in std::fs::read_dir(source)
                .map_err(|e| format!("Failed to read extracted directory: {}", e))? 
            {
                let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
                let path = entry.path();
                if path.is_dir() && path.join("BepInEx").exists() {
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
                "BepInEx".to_string(),
                "dotnet".to_string(),
                ".doorstop_version".to_string(),
                "doorstop_config.ini".to_string(),
                "dxgi.dll".to_string(),
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
