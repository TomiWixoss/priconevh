use crate::services::FileService;
use std::path::PathBuf;

#[tauri::command]
pub async fn get_disk_space(path: String) -> Result<(u64, u64), String> {
    let path_buf = PathBuf::from(path);
    
    #[cfg(target_os = "windows")]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        use winapi::um::fileapi::GetDiskFreeSpaceExW;

        let root = path_buf.ancestors().last()
            .ok_or_else(|| "Failed to get root path".to_string())?;

        let root_wide: Vec<u16> = OsStr::new(root)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        let mut free_bytes: u64 = 0;
        let mut total_bytes: u64 = 0;

        unsafe {
            if GetDiskFreeSpaceExW(
                root_wide.as_ptr(),
                &mut free_bytes as *mut u64 as *mut _,
                &mut total_bytes as *mut u64 as *mut _,
                std::ptr::null_mut(),
            ) == 0 {
                return Err("Failed to get disk space".to_string());
            }
        }

        Ok((free_bytes, total_bytes))
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok((0, 0))
    }
}

#[tauri::command]
pub async fn check_disk_space(path: String, required_bytes: u64) -> Result<bool, String> {
    let path_buf = PathBuf::from(path);
    FileService::check_disk_space(&path_buf, required_bytes)
}

#[tauri::command]
pub async fn get_directory_size(path: String) -> Result<u64, String> {
    let path_buf = PathBuf::from(path);
    FileService::get_dir_size(&path_buf)
}

#[tauri::command]
pub async fn open_directory(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub async fn create_backup(source_path: String, backup_name: String) -> Result<String, String> {
    let source = PathBuf::from(source_path);
    let backup_path = FileService::create_backup(&source, &backup_name)?;
    Ok(backup_path.to_string_lossy().to_string())
}
