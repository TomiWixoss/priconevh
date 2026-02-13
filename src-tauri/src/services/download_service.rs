use reqwest::Client;
use std::path::PathBuf;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;
use futures_util::StreamExt;

pub struct DownloadService {
    client: Client,
}

impl DownloadService {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .user_agent("PriconneVH-Installer/1.0")
                .build()
                .unwrap(),
        }
    }

    /// Download file với progress callback
    pub async fn download_file<F>(
        &self,
        url: &str,
        dest_path: PathBuf,
        mut progress_callback: F,
    ) -> Result<PathBuf, String>
    where
        F: FnMut(u64, u64) + Send + 'static,
    {
        // Tạo thư mục nếu chưa có
        if let Some(parent) = dest_path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }

        // Gửi request
        let response = self.client
            .get(url)
            .send()
            .await
            .map_err(|e| format!("Failed to start download: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Download failed with status: {}", response.status()));
        }

        // Lấy tổng kích thước file
        let total_size = response.content_length().unwrap_or(0);

        // Tạo file
        let mut file = File::create(&dest_path)
            .await
            .map_err(|e| format!("Failed to create file: {}", e))?;

        // Download với streaming
        let mut downloaded: u64 = 0;
        let mut stream = response.bytes_stream();

        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|e| format!("Error while downloading: {}", e))?;
            
            file.write_all(&chunk)
                .await
                .map_err(|e| format!("Failed to write to file: {}", e))?;

            downloaded += chunk.len() as u64;
            progress_callback(downloaded, total_size);
        }

        file.flush()
            .await
            .map_err(|e| format!("Failed to flush file: {}", e))?;

        Ok(dest_path)
    }

    /// Download file đơn giản không có progress
    pub async fn download_simple(&self, url: &str, dest_path: PathBuf) -> Result<PathBuf, String> {
        self.download_file(url, dest_path, |_, _| {}).await
    }

    /// Lấy kích thước file từ URL
    pub async fn get_file_size(&self, url: &str) -> Result<u64, String> {
        let response = self.client
            .head(url)
            .send()
            .await
            .map_err(|e| format!("Failed to get file info: {}", e))?;

        Ok(response.content_length().unwrap_or(0))
    }
}

impl Default for DownloadService {
    fn default() -> Self {
        Self::new()
    }
}
