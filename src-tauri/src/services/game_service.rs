use crate::models::GameInfo;
use std::path::PathBuf;
use std::fs;

pub struct GameService;

impl GameService {
    /// Tự động tìm thư mục game bằng cách quét các ổ đĩa
    pub fn auto_detect_game_path() -> Option<PathBuf> {
        // 1. Tìm trong Registry trước (nhanh nhất)
        if let Some(path) = Self::find_in_registry() {
            if path.exists() && Self::validate_game_path(path.clone()).is_ok() {
                return Some(path);
            }
        }

        // 2. Tìm trong các thư mục phổ biến
        if let Some(path) = Self::search_common_locations() {
            return Some(path);
        }

        // 3. Quét tất cả ổ đĩa tìm thư mục "priconner"
        // Tìm TẤT CẢ các thư mục "priconner" và chọn thư mục hợp lệ
        let all_candidates = Self::find_all_priconner_folders();
        
        // Lọc và chọn thư mục hợp lệ đầu tiên
        for candidate in all_candidates {
            if Self::validate_game_path(candidate.clone()).is_ok() {
                return Some(candidate);
            }
        }

        None
    }

    /// Tìm TẤT CẢ các thư mục có tên "priconner"
    #[cfg(target_os = "windows")]
    fn find_all_priconner_folders() -> Vec<PathBuf> {
        let mut candidates = Vec::new();

        // Lấy danh sách tất cả ổ đĩa (C: đến Z:)
        let drives: Vec<String> = ('C'..='Z')
            .map(|c| format!("{}:\\", c))
            .filter(|drive| PathBuf::from(drive).exists())
            .collect();

        for drive in drives {
            // Quét thư mục gốc của ổ đĩa
            Self::collect_priconner_folders(&PathBuf::from(&drive), 2, &mut candidates);

            // Quét các thư mục phổ biến trong ổ đĩa
            let common_folders = vec![
                "Games",
                "Program Files",
                "Program Files (x86)",
                "DMM GAMES",
            ];

            for folder in common_folders {
                let base_path = PathBuf::from(&drive).join(folder);
                if base_path.exists() {
                    Self::collect_priconner_folders(&base_path, 2, &mut candidates);
                }
            }
        }

        candidates
    }

    #[cfg(not(target_os = "windows"))]
    fn find_all_priconner_folders() -> Vec<PathBuf> {
        let mut candidates = Vec::new();
        
        // Trên Linux/macOS, quét thư mục home
        if let Some(home) = dirs::home_dir() {
            Self::collect_priconner_folders(&home, 3, &mut candidates);
        }
        
        candidates
    }

    /// Thu thập TẤT CẢ các thư mục "priconner" (không validate ngay)
    fn collect_priconner_folders(base_path: &PathBuf, max_depth: usize, candidates: &mut Vec<PathBuf>) {
        if max_depth == 0 {
            return;
        }

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

            // Bỏ qua các thư mục hệ thống
            if let Some(name) = path.file_name() {
                let name_str = name.to_string_lossy().to_lowercase();
                
                // Bỏ qua thư mục hệ thống
                if name_str.starts_with('$') 
                    || name_str == "windows" 
                    || name_str == "system volume information"
                    || name_str == "recovery"
                    || name_str == "perflogs"
                    || name_str == "node_modules"
                    || name_str == ".git" {
                    continue;
                }

                // Tìm thấy thư mục "priconner" → Thêm vào danh sách
                if name_str == "priconner" {
                    candidates.push(path.clone());
                }
            }

            // Tìm kiếm đệ quy trong thư mục con
            Self::collect_priconner_folders(&path, max_depth - 1, candidates);
        }
    }

    /// Tìm trong các thư mục phổ biến
    fn search_common_locations() -> Option<PathBuf> {
        let possible_paths = vec![
            // Tên thư mục chính xác
            "C:\\priconner",
            "D:\\priconner",
            "E:\\priconner",
            "F:\\priconner",
            
            // Steam locations
            "C:\\Program Files (x86)\\Steam\\steamapps\\common\\priconner",
            "D:\\Steam\\steamapps\\common\\priconner",
            "E:\\Steam\\steamapps\\common\\priconner",
            
            // DMM locations
            "C:\\Program Files\\DMM GAMES\\priconner",
            "C:\\Program Files (x86)\\DMM GAMES\\priconner",
            "D:\\DMM GAMES\\priconner",
            
            // Custom game folders
            "C:\\Games\\priconner",
            "D:\\Games\\priconner",
            "E:\\Games\\priconner",
            
            // User folders
            "C:\\Users\\Public\\priconner",
        ];

        for path_str in possible_paths {
            let path = PathBuf::from(path_str);
            if path.exists() && Self::validate_game_path(path.clone()).is_ok() {
                return Some(path);
            }
        }

        None
    }

    /// Quét tất cả ổ đĩa tìm thư mục "priconner" (DEPRECATED - dùng find_all_priconner_folders)
    #[cfg(target_os = "windows")]
    fn scan_all_drives() -> Option<PathBuf> {
        let all_candidates = Self::find_all_priconner_folders();
        
        for candidate in all_candidates {
            if Self::validate_game_path(candidate.clone()).is_ok() {
                return Some(candidate);
            }
        }
        
        None
    }

    #[cfg(not(target_os = "windows"))]
    fn scan_all_drives() -> Option<PathBuf> {
        let all_candidates = Self::find_all_priconner_folders();
        
        for candidate in all_candidates {
            if Self::validate_game_path(candidate.clone()).is_ok() {
                return Some(candidate);
            }
        }
        
        None
    }

    /// Tìm kiếm thư mục "priconner" trong một thư mục (DEPRECATED)
    fn search_directory(base_path: &PathBuf, max_depth: usize) -> Option<PathBuf> {
        let mut candidates = Vec::new();
        Self::collect_priconner_folders(base_path, max_depth, &mut candidates);
        
        for candidate in candidates {
            if Self::validate_game_path(candidate.clone()).is_ok() {
                return Some(candidate);
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
