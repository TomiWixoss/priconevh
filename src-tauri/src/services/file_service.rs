use std::path::{Path, PathBuf};
use std::fs;
use zip::ZipArchive;

pub struct FileService;

impl FileService {
    /// Giải nén file zip
    pub fn extract_zip(zip_path: &Path, extract_to: &Path) -> Result<(), String> {
        let file = fs::File::open(zip_path)
            .map_err(|e| format!("Failed to open zip file: {}", e))?;

        let mut archive = ZipArchive::new(file)
            .map_err(|e| format!("Failed to read zip archive: {}", e))?;

        // Tạo thư mục đích nếu chưa có
        fs::create_dir_all(extract_to)
            .map_err(|e| format!("Failed to create extraction directory: {}", e))?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i)
                .map_err(|e| format!("Failed to read file from archive: {}", e))?;

            let outpath = match file.enclosed_name() {
                Some(path) => extract_to.join(path),
                None => continue,
            };

            if file.name().ends_with('/') {
                // Đây là thư mục
                fs::create_dir_all(&outpath)
                    .map_err(|e| format!("Failed to create directory: {}", e))?;
            } else {
                // Đây là file
                if let Some(parent) = outpath.parent() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create parent directory: {}", e))?;
                }

                let mut outfile = fs::File::create(&outpath)
                    .map_err(|e| format!("Failed to create file: {}", e))?;

                std::io::copy(&mut file, &mut outfile)
                    .map_err(|e| format!("Failed to extract file: {}", e))?;
            }

            // Set permissions on Unix
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                if let Some(mode) = file.unix_mode() {
                    fs::set_permissions(&outpath, fs::Permissions::from_mode(mode))
                        .map_err(|e| format!("Failed to set permissions: {}", e))?;
                }
            }
        }

        Ok(())
    }

    /// Xóa thư mục hoặc file
    pub fn remove_path(path: &Path) -> Result<(), String> {
        if path.is_dir() {
            fs::remove_dir_all(path)
                .map_err(|e| format!("Failed to remove directory: {}", e))
        } else if path.is_file() {
            fs::remove_file(path)
                .map_err(|e| format!("Failed to remove file: {}", e))
        } else {
            Ok(())
        }
    }

    /// Copy thư mục đệ quy
    pub fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
        fs::create_dir_all(dst)
            .map_err(|e| format!("Failed to create destination directory: {}", e))?;

        for entry in fs::read_dir(src)
            .map_err(|e| format!("Failed to read source directory: {}", e))? 
        {
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let path = entry.path();
            let dest_path = dst.join(entry.file_name());

            if path.is_dir() {
                Self::copy_dir_recursive(&path, &dest_path)?;
            } else {
                fs::copy(&path, &dest_path)
                    .map_err(|e| format!("Failed to copy file: {}", e))?;
            }
        }

        Ok(())
    }

    /// Tạo backup của thư mục
    pub fn create_backup(source: &Path, backup_name: &str) -> Result<PathBuf, String> {
        let parent = source.parent()
            .ok_or_else(|| "Source has no parent directory".to_string())?;

        let backup_path = parent.join(format!("{}_backup", backup_name));

        if backup_path.exists() {
            Self::remove_path(&backup_path)?;
        }

        Self::copy_dir_recursive(source, &backup_path)?;

        Ok(backup_path)
    }

    /// Lấy kích thước thư mục
    pub fn get_dir_size(path: &Path) -> Result<u64, String> {
        let mut total_size = 0u64;

        if path.is_file() {
            return Ok(fs::metadata(path)
                .map_err(|e| format!("Failed to get file metadata: {}", e))?
                .len());
        }

        for entry in fs::read_dir(path)
            .map_err(|e| format!("Failed to read directory: {}", e))? 
        {
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let path = entry.path();

            if path.is_dir() {
                total_size += Self::get_dir_size(&path)?;
            } else {
                total_size += fs::metadata(&path)
                    .map_err(|e| format!("Failed to get file metadata: {}", e))?
                    .len();
            }
        }

        Ok(total_size)
    }

    /// Kiểm tra đủ dung lượng đĩa không
    pub fn check_disk_space(path: &Path, required_bytes: u64) -> Result<bool, String> {
        #[cfg(target_os = "windows")]
        {
            use std::ffi::OsStr;
            use std::os::windows::ffi::OsStrExt;
            use winapi::um::fileapi::GetDiskFreeSpaceExW;

            let root = path.ancestors().last()
                .ok_or_else(|| "Failed to get root path".to_string())?;

            let root_wide: Vec<u16> = OsStr::new(root)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();

            let mut free_bytes: u64 = 0;

            unsafe {
                if GetDiskFreeSpaceExW(
                    root_wide.as_ptr(),
                    std::ptr::null_mut(),
                    std::ptr::null_mut(),
                    &mut free_bytes as *mut u64 as *mut _,
                ) == 0 {
                    return Err("Failed to get disk space".to_string());
                }
            }

            Ok(free_bytes >= required_bytes)
        }

        #[cfg(not(target_os = "windows"))]
        {
            // Fallback cho các hệ điều hành khác
            Ok(true)
        }
    }
}
