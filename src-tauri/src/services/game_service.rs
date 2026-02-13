use crate::models::GameInfo;
use std::path::PathBuf;
use std::fs;

pub struct GameService;

impl GameService {
    /// Tự động tìm thư mục game trong thư mục user hiện tại
    pub fn auto_detect_game_path() -> Option<PathBuf> {
        // Chỉ quét thư mục user hiện tại (C:\Users\<username>)
        if let Some(user_dir) = dirs::home_dir() {
            let all_candidates = Self::find_all_priconner_folders_in_dir(&user_dir);
            
            for candidate in all_candidates {
                if Self::validate_game_path(candidate.clone()).is_ok() {
                    return Some(candidate);
                }
            }
        }

        None
    }

    /// Tìm TẤT CẢ các thư mục có tên "priconner" trong một thư mục cụ thể
    fn find_all_priconner_folders_in_dir(base_dir: &PathBuf) -> Vec<PathBuf> {
        let mut candidates = Vec::new();
        Self::collect_priconner_folders(base_dir, &mut candidates);
        candidates
    }

    /// Thu thập TẤT CẢ các thư mục "priconner" (không validate ngay)
    fn collect_priconner_folders(base_path: &PathBuf, candidates: &mut Vec<PathBuf>) {
        // Đọc các thư mục con
        let entries = match fs::read_dir(base_path) {
            Ok(entries) => entries,
            Err(_) => return,
        };

        for entry in entries.flatten() {
            let path = entry.path();
            
            // Bỏ qua files, chỉ xét thư mục
            if !path.is_dir() {
                continue;
            }

            // Bỏ qua các thư mục hệ thống và không cần thiết
            if let Some(name) = path.file_name() {
                let name_str = name.to_string_lossy().to_lowercase();
                
                // Chỉ loại trừ những thư mục chắc chắn 100% không có game
                if name_str.starts_with('$')  // $Recycle.Bin, $WinREAgent, etc.
                    || name_str == "appdata"
                    || name_str == "application data"
                    || name_str == "local settings"
                    || name_str == "ntuser"
                    || name_str == "temp"
                    || name_str == "tmp"
                    || name_str == "node_modules"
                    || name_str == ".git"
                    || name_str == ".vscode" {
                    continue;
                }

                // Tìm thấy thư mục "priconner" → Thêm vào danh sách
                if name_str == "priconner" {
                    candidates.push(path.clone());
                    continue;  // Không cần scan sâu hơn trong thư mục game
                }
            }

            // Tìm kiếm đệ quy trong thư mục con (không giới hạn depth)
            Self::collect_priconner_folders(&path, candidates);
        }
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
