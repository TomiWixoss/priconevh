use crate::services::{UpdaterService, AppUpdateInfo};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

// State để share UpdaterService
pub struct UpdaterState {
    pub service: Arc<Mutex<UpdaterService>>,
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

    // Chạy MSI installer
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        let installer_str = installer_path.to_string_lossy().to_string();
        
        // Chạy MSI installer với quyền admin
        Command::new("msiexec")
            .args(&["/i", &installer_str])
            .spawn()
            .map_err(|e| format!("Failed to run installer: {}", e))?;
        
        // Đóng app hiện tại để installer có thể cập nhật
        std::process::exit(0);
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Auto update only supported on Windows".to_string())
    }
}
