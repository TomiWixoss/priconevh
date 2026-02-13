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
        // Kiểm tra các file quan trọng của game
        let required_files = vec![
            "PrincessConnectReDive.exe",
            "UnityPlayer.dll",
        ];

        self.is_valid = required_files.iter().all(|file| {
            self.path.join(file).exists()
        });

        self.is_valid
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
