use crate::models::GameInfo;
use crate::services::GameService;
use std::path::PathBuf;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

#[tauri::command]
pub async fn auto_detect_game() -> Result<Option<String>, String> {
    match GameService::auto_detect_game_path() {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn select_game_directory(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let folder = app.dialog()
        .file()
        .set_title("Chọn thư mục game Princess Connect Re:Dive")
        .blocking_pick_folder();

    if let Some(path) = folder {
        let path_str = path.to_string_lossy().to_string();
        
        // Validate game path
        match GameService::validate_game_path(PathBuf::from(&path_str)) {
            Ok(_) => {
                // Tự động lưu vào config
                let mut config = crate::models::AppConfig::load().unwrap_or_default();
                config.game_path = Some(PathBuf::from(&path_str));
                config.save()?;
                
                Ok(Some(path_str))
            }
            Err(e) => {
                // Show error dialog
                app.dialog()
                    .message(format!("Thư mục không hợp lệ: {}", e))
                    .kind(MessageDialogKind::Error)
                    .title("Lỗi")
                    .blocking_show();
                
                Err(e)
            }
        }
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn validate_game_path(path: String) -> Result<GameInfo, String> {
    let path_buf = PathBuf::from(path);
    GameService::validate_game_path(path_buf)
}

#[tauri::command]
pub async fn get_game_info(path: String) -> Result<GameInfo, String> {
    let path_buf = PathBuf::from(path);
    let mut game_info = GameService::validate_game_path(path_buf)?;
    
    if let Some(version) = GameService::get_game_version(&game_info.path) {
        game_info.version = Some(version);
    }
    
    Ok(game_info)
}
