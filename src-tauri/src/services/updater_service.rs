use crate::services::{DownloadService, GitHubService};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppUpdateInfo {
    pub version: String,
    pub current_version: String,
    pub release_date: String,
    pub download_url: String,
    pub file_size: u64,
    pub changelog: Vec<String>,
}

pub struct UpdaterService {
    github_service: GitHubService,
    download_service: DownloadService,
    current_version: String,
}

impl UpdaterService {
    pub fn new(github_repo: String, current_version: String) -> Self {
        Self {
            github_service: GitHubService::new(github_repo),
            download_service: DownloadService::new(),
            current_version,
        }
    }

    /// Kiểm tra cập nhật app
    pub async fn check_for_updates(&self) -> Result<Option<AppUpdateInfo>, String> {
        let latest = self.github_service.get_latest_release().await?;
        
        // So sánh version
        if self.is_newer_version(&latest.tag_name) {
            // Tìm file .msi hoặc .exe trong assets
            let asset = latest.assets.iter().find(|a| {
                let name = a.name.to_lowercase();
                name.ends_with(".msi") || name.ends_with(".exe")
            }).ok_or_else(|| "No installer found in release".to_string())?;

            let changelog: Vec<String> = latest.body
                .lines()
                .filter(|line| !line.trim().is_empty())
                .map(|line| line.trim().to_string())
                .collect();

            Ok(Some(AppUpdateInfo {
                version: latest.tag_name,
                current_version: self.current_version.clone(),
                release_date: latest.published_at,
                download_url: asset.browser_download_url.clone(),
                file_size: asset.size,
                changelog,
            }))
        } else {
            Ok(None)
        }
    }

    /// Tải và cài đặt cập nhật
    pub async fn download_and_install<F>(
        &self,
        update_info: &AppUpdateInfo,
        progress_callback: F,
    ) -> Result<PathBuf, String>
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
        let temp_dir = std::env::temp_dir().join("priconevh_update");
        std::fs::create_dir_all(&temp_dir)
            .map_err(|e| format!("Failed to create temp directory: {}", e))?;

        // Xác định tên file
        let file_name = update_info.download_url
            .split('/')
            .last()
            .unwrap_or("installer.msi");
        
        let installer_path = temp_dir.join(file_name);

        // Download installer
        {
            let progress = progress.clone();
            progress.lock().unwrap()("Đang tải xuống bản cập nhật...", 10.0);
        }
        
        {
            let progress = progress.clone();
            self.download_service
                .download_file(
                    &update_info.download_url,
                    installer_path.clone(),
                    move |downloaded, total| {
                        if total > 0 {
                            let percent = 10.0 + (downloaded as f32 / total as f32) * 80.0;
                            progress.lock().unwrap()("Đang tải xuống...", percent);
                        }
                    },
                )
                .await?;
        }

        {
            let progress = progress.clone();
            progress.lock().unwrap()("Tải xuống hoàn tất!", 100.0);
        }

        Ok(installer_path)
    }

    /// So sánh version (đơn giản)
    fn is_newer_version(&self, new_version: &str) -> bool {
        // Loại bỏ 'v' prefix nếu có
        let current = self.current_version.trim_start_matches('v');
        let new = new_version.trim_start_matches('v');
        
        // So sánh string đơn giản (có thể cải tiến sau)
        new > current
    }
}
