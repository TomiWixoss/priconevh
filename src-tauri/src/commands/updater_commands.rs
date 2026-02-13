use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;

#[tauri::command]
pub async fn check_app_update(app: AppHandle) -> Result<Option<AppUpdateInfo>, String> {
    let updater = app.updater_builder().build()
        .map_err(|e| format!("Failed to build updater: {}", e))?;

    match updater.check().await {
        Ok(Some(update)) => {
            Ok(Some(AppUpdateInfo {
                version: update.version,
                current_version: update.current_version,
                date: update.date.map(|d| d.to_string()),
                body: update.body,
            }))
        }
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Failed to check for updates: {}", e)),
    }
}

#[tauri::command]
pub async fn download_and_install_update(app: AppHandle) -> Result<(), String> {
    let updater = app.updater_builder().build()
        .map_err(|e| format!("Failed to build updater: {}", e))?;

    if let Some(update) = updater.check().await
        .map_err(|e| format!("Failed to check for updates: {}", e))? 
    {
        // Emit progress events
        let app_clone = app.clone();
        
        update.download_and_install(
            |chunk_length, content_length| {
                if let Some(total) = content_length {
                    let progress = (chunk_length as f32 / total as f32) * 100.0;
                    let _ = app_clone.emit("updater-progress", progress);
                }
            },
            || {
                let _ = app_clone.emit("updater-completed", ());
            }
        ).await
        .map_err(|e| format!("Failed to download and install update: {}", e))?;

        Ok(())
    } else {
        Err("No update available".to_string())
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AppUpdateInfo {
    pub version: String,
    pub current_version: String,
    pub date: Option<String>,
    pub body: Option<String>,
}
