use crate::services::UpdaterService;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager};
use tokio::sync::Mutex;

// State để share UpdaterService
pub struct UpdaterState {
    pub service: Arc<Mutex<UpdaterService>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppUpdateInfo {
    pub version: String,
    pub current_version: String,
    pub release_date: String,
    pub download_url: String,
    pub file_size: u64,
    pub changelog: Vec<String>,
}

#[tauri::command]
pub async fn check_app_update(
    state: tauri::State<'_, UpdaterState>,
) -> Result<Option<AppUpdateInfo>, String> {
    let service = state.service.lock().await;
    service.check_for_updates().await
}

#[tauri::command]
pub async fn download_and_install_update(
    app: AppHandle,
    state: tauri::State<'_, UpdaterState>,
    update_info: AppUpdateInfo,
) -> Result<(), String> {
    let service = state.service.lock().await;
    
    // Download installer
    let installer_path = service.download_and_install(
        &update_info,
        move |message, progress| {
            let _ = app.emit("updater-progress", (message, progress));
        },
    ).await?;

    // Chạy installer
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        let installer_str = installer_path.to_string_lossy().to_string();
        
        // Chạy installer với quyền admin
        if installer_str.ends_with(".msi") {
            // MSI installer
            Command::new("msiexec")
                .args(&["/i", &installer_str])
                .spawn()
                .map_err(|e| format!("Failed to run installer: {}", e))?;
        } else {
            // EXE installer
            Command::new(&installer_str)
                .spawn()
                .map_err(|e| format!("Failed to run installer: {}", e))?;
        }
        
        // Đóng app hiện tại để installer có thể cập nhật
        std::process::exit(0);
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Auto update only supported on Windows".to_string())
    }
}
