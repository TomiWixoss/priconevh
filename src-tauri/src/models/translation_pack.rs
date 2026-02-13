use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationVersion {
    pub version: String,
    pub release_date: String,
    pub download_url: String,
    pub file_size: u64,
    pub changelog: Vec<String>,
    pub download_count: u64,  // Số lượt tải
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranslationPack {
    pub latest_version: String,
    pub versions: Vec<TranslationVersion>,
    pub github_repo: String,
}

impl TranslationPack {
    pub fn new(github_repo: String) -> Self {
        Self {
            latest_version: String::new(),
            versions: Vec::new(),
            github_repo,
        }
    }

    pub fn get_latest(&self) -> Option<&TranslationVersion> {
        self.versions.first()
    }

    pub fn get_version(&self, version: &str) -> Option<&TranslationVersion> {
        self.versions.iter().find(|v| v.version == version)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubRelease {
    pub tag_name: String,
    pub name: String,
    pub published_at: String,
    pub body: String,
    pub assets: Vec<GitHubAsset>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubAsset {
    pub name: String,
    pub size: u64,
    pub browser_download_url: String,
    pub download_count: u64,  // Số lượt tải
}
