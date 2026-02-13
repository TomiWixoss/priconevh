mod models;
mod services;
mod commands;

use commands::*;
use models::AppConfig;
use services::TranslationService;
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Setup state
        .setup(|app| {
            // Load config
            let config = AppConfig::load().unwrap_or_default();
            
            // Initialize TranslationService
            let translation_service = TranslationService::new(config.github_repo.clone());
            let translation_state = TranslationState {
                service: Arc::new(Mutex::new(translation_service)),
            };
            
            app.manage(translation_state);
            
            // Setup autostart if enabled
            if config.auto_start {
                #[cfg(desktop)]
                {
                    use tauri_plugin_autostart::MacosLauncher;
                    use tauri_plugin_autostart::ManagerExt;
                    
                    let _ = app.autolaunch().enable();
                }
            }
            
            Ok(())
        })
        // Plugins
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        // Commands
        .invoke_handler(tauri::generate_handler![
            // Game commands
            auto_detect_game,
            validate_game_path,
            get_game_info,
            
            // Translation commands
            get_available_translations,
            check_translation_updates,
            install_translation,
            update_translation,
            uninstall_translation,
            get_translation_info,
            
            // Config commands
            load_config,
            save_config,
            update_game_path,
            toggle_auto_update,
            toggle_auto_start,
            set_github_repo,
            
            // System commands
            get_disk_space,
            check_disk_space,
            get_directory_size,
            open_directory,
            create_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
