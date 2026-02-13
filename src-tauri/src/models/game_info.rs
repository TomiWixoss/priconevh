use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameInfo {
    pub path: PathBuf,
    pub version: Option<String>,
    pub is_valid: bool,
    pub has_translation: bool,
    pub translation_version: Option<String>,
}

impl GameInfo {
    pub fn new(path: PathBuf) -> Self {
        Self {
            path,
            version: None,
            is_valid: false,
            has_translation: false,
            translation_version: None,
        }
    }

    pub fn validate(&mut self) -> bool {
        // Kiểm tra các file quan trọng của game Princess Connect Re:Dive
        let required_files = vec![
            "PrincessConnectReDive.exe",
            "UnityPlayer.dll",
            "GameAssembly.dll",
        ];

        // Kiểm tra thư mục Data
        let data_folder_exists = self.path.join("PrincessConnectReDive_Data").exists();

        // Game hợp lệ nếu có tất cả file cần thiết VÀ thư mục Data
        self.is_valid = required_files.iter().all(|file| {
            self.path.join(file).exists()
        }) && data_folder_exists;

        self.is_valid
    }

    /// Kiểm tra chi tiết các file game (dùng cho cảnh báo)
    pub fn get_missing_files(&self) -> Vec<String> {
        let required_files = vec![
            "PrincessConnectReDive.exe",
            "UnityPlayer.dll",
            "GameAssembly.dll",
        ];

        let mut missing = Vec::new();

        for file in required_files {
            if !self.path.join(file).exists() {
                missing.push(file.to_string());
            }
        }

        if !self.path.join("PrincessConnectReDive_Data").exists() {
            missing.push("PrincessConnectReDive_Data/".to_string());
        }

        missing
    }

    pub fn check_translation(&mut self) -> bool {
        // Kiểm tra xem đã có bản việt hóa chưa
        let translation_marker = self.path.join("translation_info.json");
        self.has_translation = translation_marker.exists();
        
        if self.has_translation {
            if let Ok(content) = std::fs::read_to_string(&translation_marker) {
                if let Ok(info) = serde_json::from_str::<serde_json::Value>(&content) {
                    self.translation_version = info["version"].as_str().map(String::from);
                }
            }
        }

        self.has_translation
    }
}
