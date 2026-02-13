use crate::models::GameInfo;
use crate::services::GameService;
use std::path::PathBuf;

#[tauri::command]
pub async fn auto_detect_game() -> Result<Option<String>, String> {
    match GameService::auto_detect_game_path() {
        Some(path) => Ok(Some(path.to_string_lossy().to_string())),
        None => Ok(None),
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
