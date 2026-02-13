use crate::models::GameInfo;
use std::path::PathBuf;

pub struct GameService;

impl GameService {
    /// Tự động tìm thư mục game trong các vị trí phổ biến
    pub fn auto_detect_game_path() -> Option<PathBuf> {
        let possible_paths = vec![
            // Steam default locations
            "C:\\Program Files (x86)\\Steam\\steamapps\\common\\PrincessConnectReDive",
            "D:\\Steam\\steamapps\\common\\PrincessConnectReDive",
            "E:\\Steam\\steamapps\\common\\PrincessConnectReDive",
            
            // DMM locations
            "C:\\Program Files\\DMM GAMES\\PrincessConnectReDive",
            "C:\\Program Files (x86)\\DMM GAMES\\PrincessConnectReDive",
            "D:\\DMM GAMES\\PrincessConnectReDive",
            
            // Custom game folders
            "C:\\Games\\PrincessConnectReDive",
            "D:\\Games\\PrincessConnectReDive",
            "E:\\Games\\PrincessConnectReDive",
        ];

        // Tìm trong Registry (Windows)
        if let Some(path) = Self::find_in_registry() {
            if path.exists() {
                return Some(path);
            }
        }

        // Tìm trong các thư mục phổ biến
        for path_str in possible_paths {
            let path = PathBuf::from(path_str);
            if path.exists() {
                let mut game_info = GameInfo::new(path.clone());
                if game_info.validate() {
                    return Some(path);
                }
            }
        }

        None
    }

    /// Tìm game path trong Windows Registry
    #[cfg(target_os = "windows")]
    fn find_in_registry() -> Option<PathBuf> {
        use winreg::enums::*;
        use winreg::RegKey;

        let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
        
        // Thử tìm trong Steam registry
        if let Ok(steam_key) = hklm.open_subkey("SOFTWARE\\Wow6432Node\\Valve\\Steam") {
            if let Ok(install_path) = steam_key.get_value::<String, _>("InstallPath") {
                let game_path = PathBuf::from(install_path)
                    .join("steamapps")
                    .join("common")
                    .join("PrincessConnectReDive");
                
                if game_path.exists() {
                    return Some(game_path);
                }
            }
        }

        None
    }

    #[cfg(not(target_os = "windows"))]
    fn find_in_registry() -> Option<PathBuf> {
        None
    }

    /// Validate game directory
    pub fn validate_game_path(path: PathBuf) -> Result<GameInfo, String> {
        let mut game_info = GameInfo::new(path);
        
        if !game_info.validate() {
            return Err("Invalid game directory. Required files not found.".to_string());
        }

        game_info.check_translation();
        Ok(game_info)
    }

    /// Lấy thông tin phiên bản game
    pub fn get_game_version(game_path: &PathBuf) -> Option<String> {
        // Đọc version từ file version.txt hoặc assembly info
        let version_file = game_path.join("version.txt");
        if version_file.exists() {
            if let Ok(content) = std::fs::read_to_string(version_file) {
                return Some(content.trim().to_string());
            }
        }

        None
    }
}
