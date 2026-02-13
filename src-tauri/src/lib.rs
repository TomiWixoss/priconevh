// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::PathBuf;
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn find_game_directory() -> Result<Option<String>, String> {
    // Tìm thư mục game Priconne trong các vị trí phổ biến
    let possible_paths = vec![
        "C:\\Program Files\\PrincessConnectReDive",
        "C:\\Program Files (x86)\\PrincessConnectReDive",
        "D:\\Games\\PrincessConnectReDive",
        "E:\\Games\\PrincessConnectReDive",
    ];
    
    for path in possible_paths {
        let path_buf = PathBuf::from(path);
        if path_buf.exists() {
            return Ok(Some(path.to_string()));
        }
    }
    
    Ok(None)
}

#[tauri::command]
async fn download_translation_pack(url: String, dest_path: String) -> Result<String, String> {
    // Download file từ GitHub
    let response = reqwest::get(&url)
        .await
        .map_err(|e| format!("Download failed: {}", e))?;
    
    let bytes = response.bytes()
        .await
        .map_err(|e| format!("Failed to read bytes: {}", e))?;
    
    std::fs::write(&dest_path, bytes)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(dest_path)
}

#[tauri::command]
async fn extract_zip(zip_path: String, extract_to: String) -> Result<String, String> {
    let file = std::fs::File::open(&zip_path)
        .map_err(|e| format!("Failed to open zip: {}", e))?;
    
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("Failed to read zip: {}", e))?;
    
    archive.extract(&extract_to)
        .map_err(|e| format!("Failed to extract: {}", e))?;
    
    Ok(extract_to)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"])))
        .invoke_handler(tauri::generate_handler![
            greet,
            find_game_directory,
            download_translation_pack,
            extract_zip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
