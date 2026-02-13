use crate::models::GameInfo;
use std::path::PathBuf;

pub struct GameService;

impl GameService {
    /// Tự động tìm thư mục game - chỉ check path mặc định của DMM
    pub fn auto_detect_game_path() -> Option<PathBuf> {
        // Lấy thư mục user hiện tại
        if let Some(user_dir) = dirs::home_dir() {
            // DMM mặc định cài trong C:\Users\<username>\priconner
            let game_path = user_dir.join("priconner");
            
            if game_path.exists() && Self::validate_game_path(game_path.clone()).is_ok() {
                return Some(game_path);
            }
        }

        None
    }

    /// Validate game directory và trả về thông tin chi tiết
    pub fn validate_game_path(path: PathBuf) -> Result<GameInfo, String> {
        let mut game_info = GameInfo::new(path.clone());
        
        if !game_info.validate() {
            let missing_files = game_info.get_missing_files();
            
            if missing_files.is_empty() {
                return Err("Thư mục không hợp lệ. Không tìm thấy file game cần thiết.".to_string());
            } else {
                let missing_list = missing_files.join(", ");
                return Err(format!(
                    "Thư mục không phải là game Princess Connect Re:Dive.\n\nThiếu các file: {}",
                    missing_list
                ));
            }
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
