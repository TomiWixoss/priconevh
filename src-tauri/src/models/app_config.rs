use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub game_path: Option<PathBuf>,
    pub auto_update: bool,
    pub auto_start: bool,
    pub github_repo: String,
    pub check_update_on_startup: bool,
    pub language: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            game_path: None,
            auto_update: true,
            auto_start: false,
            github_repo: "TomiWixoss/priconevh".to_string(),
            check_update_on_startup: true,
            language: "vi".to_string(),
        }
    }
}

impl AppConfig {
    pub fn load() -> Result<Self, String> {
        let config_path = Self::get_config_path()?;
        
        if config_path.exists() {
            let content = std::fs::read_to_string(&config_path)
                .map_err(|e| format!("Failed to read config: {}", e))?;
            
            serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse config: {}", e))
        } else {
            Ok(Self::default())
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let config_path = Self::get_config_path()?;
        
        if let Some(parent) = config_path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create config directory: {}", e))?;
        }

        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;

        std::fs::write(&config_path, content)
            .map_err(|e| format!("Failed to write config: {}", e))?;

        Ok(())
    }

    fn get_config_path() -> Result<PathBuf, String> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| "Failed to get config directory".to_string())?;
        
        Ok(config_dir.join("priconevh").join("config.json"))
    }
}
