use crate::models::{TranslationPack, TranslationVersion};
use crate::services::TranslationService;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::Mutex;

// State để share TranslationService
pub struct TranslationState {
    pub service: Arc<Mutex<TranslationService>>,
}

#[tauri::command]
pub async fn get_available_translations(
    state: tauri::State<'_, TranslationState>,
) -> Result<TranslationPack, String> {
    let service = state.service.lock().await;
    service.github_service.get_translation_pack().await
}

#[tauri::command]
pub async fn check_translation_updates(
    state: tauri::State<'_, TranslationState>,
    current_version: String,
) -> Result<Option<TranslationVersion>, String> {
    let service = state.service.lock().await;
    service.check_for_updates(&current_version).await
}

#[tauri::command]
pub async fn install_translation(
    app: AppHandle,
    state: tauri::State<'_, TranslationState>,
    game_path: String,
    version: TranslationVersion,
) -> Result<(), String> {
    let service = state.service.lock().await;
    
    // Validate game path
    let game_info = crate::services::GameService::validate_game_path(
        std::path::PathBuf::from(&game_path)
    )?;

    // Install với progress callback
    service.install_translation(
        &game_info,
        &version,
        move |message, progress| {
            let _ = app.emit("translation-progress", (message, progress));
        },
    ).await?;

    Ok(())
}

#[tauri::command]
pub async fn update_translation(
    app: AppHandle,
    state: tauri::State<'_, TranslationState>,
    game_path: String,
    new_version: TranslationVersion,
) -> Result<(), String> {
    let service = state.service.lock().await;
    
    let game_info = crate::services::GameService::validate_game_path(
        std::path::PathBuf::from(&game_path)
    )?;

    service.update_translation(
        &game_info,
        &new_version,
        move |message, progress| {
            let _ = app.emit("translation-progress", (message, progress));
        },
    ).await?;

    Ok(())
}

#[tauri::command]
pub async fn uninstall_translation(
    state: tauri::State<'_, TranslationState>,
    game_path: String,
) -> Result<(), String> {
    let service = state.service.lock().await;
    let path = std::path::PathBuf::from(game_path);
    service.uninstall_translation(&path)
}

#[tauri::command]
pub async fn get_translation_info(
    state: tauri::State<'_, TranslationState>,
    game_path: String,
) -> Result<Option<crate::services::translation_service::TranslationInfo>, String> {
    let service = state.service.lock().await;
    let path = std::path::PathBuf::from(game_path);
    Ok(service.get_current_translation_info(&path))
}
