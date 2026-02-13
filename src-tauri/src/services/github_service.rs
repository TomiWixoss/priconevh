use crate::models::translation_pack::{GitHubRelease, TranslationPack, TranslationVersion};
use reqwest::Client;

pub struct GitHubService {
    client: Client,
    repo: String,
}

impl GitHubService {
    pub fn new(repo: String) -> Self {
        Self {
            client: Client::builder()
                .user_agent("PriconneVH-Installer/1.0")
                .build()
                .unwrap(),
            repo,
        }
    }

    /// Lấy thông tin release mới nhất từ GitHub
    pub async fn get_latest_release(&self) -> Result<GitHubRelease, String> {
        let url = format!(
            "https://api.github.com/repos/{}/releases/latest",
            self.repo
        );

        let response = self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch latest release: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("GitHub API error: {}", response.status()));
        }

        response
            .json::<GitHubRelease>()
            .await
            .map_err(|e| format!("Failed to parse release data: {}", e))
    }

    /// Lấy tất cả releases
    pub async fn get_all_releases(&self) -> Result<Vec<GitHubRelease>, String> {
        let url = format!(
            "https://api.github.com/repos/{}/releases",
            self.repo
        );

        let response = self.client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to fetch releases: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("GitHub API error: {}", response.status()));
        }

        response
            .json::<Vec<GitHubRelease>>()
            .await
            .map_err(|e| format!("Failed to parse releases data: {}", e))
    }

    /// Chuyển đổi GitHub releases thành TranslationPack
    pub async fn get_translation_pack(&self) -> Result<TranslationPack, String> {
        let releases = self.get_all_releases().await?;
        
        let mut pack = TranslationPack::new(self.repo.clone());
        
        if let Some(latest) = releases.first() {
            pack.latest_version = latest.tag_name.clone();
        }

        pack.versions = releases
            .into_iter()
            .filter_map(|release| {
                // Tìm asset zip file
                let asset = release.assets.iter().find(|a| {
                    a.name.ends_with(".zip") && a.name.contains("PriconneTL")
                })?;

                // Parse changelog từ body
                let changelog: Vec<String> = release.body
                    .lines()
                    .filter(|line| !line.trim().is_empty())
                    .map(|line| line.trim().to_string())
                    .collect();

                Some(TranslationVersion {
                    version: release.tag_name,
                    release_date: release.published_at,
                    download_url: asset.browser_download_url.clone(),
                    file_size: asset.size,
                    changelog,
                    download_count: asset.download_count,
                })
            })
            .collect();

        Ok(pack)
    }

    /// Kiểm tra có phiên bản mới không
    pub async fn check_for_updates(&self, current_version: &str) -> Result<Option<TranslationVersion>, String> {
        let latest = self.get_latest_release().await?;
        
        if latest.tag_name != current_version {
            let asset = latest.assets.iter().find(|a| {
                a.name.ends_with(".zip") && a.name.contains("PriconneTL")
            }).ok_or_else(|| "No translation asset found".to_string())?;

            let changelog: Vec<String> = latest.body
                .lines()
                .filter(|line| !line.trim().is_empty())
                .map(|line| line.trim().to_string())
                .collect();

            Ok(Some(TranslationVersion {
                version: latest.tag_name,
                release_date: latest.published_at,
                download_url: asset.browser_download_url.clone(),
                file_size: asset.size,
                changelog,
                download_count: asset.download_count,
            }))
        } else {
            Ok(None)
        }
    }
}
