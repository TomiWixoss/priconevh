use crate::models::AppConfig;

#[tauri::command]
pub async fn load_config() -> Result<AppConfig, String> {
    AppConfig::load()
}

#[tauri::command]
pub async fn save_config(config: AppConfig) -> Result<(), String> {
    config.save()
}

#[tauri::command]
pub async fn update_game_path(path: String) -> Result<(), String> {
    let mut config = AppConfig::load()?;
    config.game_path = Some(std::path::PathBuf::from(path));
    config.save()
}

#[tauri::command]
pub async fn toggle_auto_update(enabled: bool) -> Result<(), String> {
    let mut config = AppConfig::load()?;
    config.auto_update = enabled;
    config.save()
}

#[tauri::command]
pub async fn toggle_auto_start(enabled: bool) -> Result<(), String> {
    let mut config = AppConfig::load()?;
    config.auto_start = enabled;
    config.save()
}

#[tauri::command]
pub async fn set_github_repo(repo: String) -> Result<(), String> {
    let mut config = AppConfig::load()?;
    config.github_repo = repo;
    config.save()
}
