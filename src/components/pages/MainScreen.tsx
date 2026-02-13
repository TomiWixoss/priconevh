import { useState, useEffect } from "react";
import { Download, Play, FolderOpen, CheckCircle, AlertCircle, ChevronDown, Calendar } from "lucide-react";
import { useGamePath } from "../../hooks/useGamePath";
import { useTranslation } from "../../hooks/useTranslation";
import { formatBytes, formatDate } from "../../lib/api";
import type { TranslationVersion } from "../../types";

interface MainScreenProps {
  gamePathHook: ReturnType<typeof useGamePath>;
  translationHook: ReturnType<typeof useTranslation>;
}

export function MainScreen({ gamePathHook, translationHook }: MainScreenProps) {
  const { gamePath, gameInfo, isLoading: isGameLoading, autoDetectGame, selectGameDirectory } = gamePathHook;
  const { pack, currentInfo, isLoading: _isTranslationLoading, isInstalling, progress, loadPack, install, update, loadCurrentInfo } = translationHook;

  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<TranslationVersion | null>(null);

  const hasGame = gamePath && gameInfo?.is_valid;
  const hasTranslation = gameInfo?.has_translation;

  useEffect(() => {
    if (!gamePath) {
      autoDetectGame();
    }
  }, []);

  useEffect(() => {
    if (hasGame) {
      loadPack();
      if (gamePath) {
        loadCurrentInfo(gamePath);
      }
    }
  }, [hasGame, gamePath]);

  useEffect(() => {
    if (pack && pack.versions.length > 0 && !selectedVersion) {
      setSelectedVersion(pack.versions[0]);
    }
  }, [pack]);

  const handleMainAction = async () => {
    if (!hasGame) {
      await selectGameDirectory();
      return;
    }

    if (!selectedVersion || !gamePath) return;

    const isUpdate = currentInfo && currentInfo.version !== selectedVersion.version;
    
    if (isUpdate) {
      await update(gamePath, selectedVersion);
    } else {
      await install(gamePath, selectedVersion);
    }
  };

  const getMainButtonText = () => {
    if (isInstalling) return "ĐANG CÀI ĐẶT...";
    if (!hasGame) return "CHỌN THƯ MỤC GAME";
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return "CHƠI NGAY";
    if (hasTranslation && currentInfo?.version !== selectedVersion?.version) return "CẬP NHẬT VIỆT HÓA";
    return "CÀI ĐẶT VIỆT HÓA";
  };

  const getMainButtonIcon = () => {
    if (isInstalling) return null;
    if (!hasGame) return <FolderOpen style={{ width: 24, height: 24 }} />;
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return <Play style={{ width: 24, height: 24 }} />;
    return <Download style={{ width: 24, height: 24 }} />;
  };

  return (
    <div className="main-screen">
      {/* Hero Background */}
      <div className="hero-background">
        <img 
          src="/hero.jpg" 
          alt="Princess Connect" 
          className="hero-image"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="hero-overlay" />
        <div className="hero-overlay-side" />
      </div>

      {/* Content */}
      <div className="main-screen-content">
        {/* Top Section - Title & Info */}
        <div className="main-screen-top">
          <div className="main-screen-info">
            {/* Title */}
            <div style={{ marginBottom: 32 }}>
              <div className="badge">
                <span className="badge-text">OFFICIAL RELEASE</span>
              </div>
              <h1 className="main-title">
                PRINCESS<br/>CONNECT
              </h1>
              <p className="main-subtitle">Re:Dive</p>
              <p className="main-description">Bản việt hóa chính thức</p>
            </div>

            {/* Status Info */}
            {hasGame && (
              <div className="status-card">
                <div className={`status-icon ${hasTranslation ? 'success' : 'warning'}`}>
                  {hasTranslation ? (
                    <CheckCircle style={{ width: 20, height: 20 }} />
                  ) : (
                    <AlertCircle style={{ width: 20, height: 20 }} />
                  )}
                </div>
                <div className="status-info">
                  <p className="status-label">Trạng thái</p>
                  <p className="status-text">
                    {hasTranslation 
                      ? `Đã cài việt hóa ${currentInfo?.version || ''}` 
                      : 'Chưa cài việt hóa'}
                  </p>
                </div>
                <button
                  onClick={selectGameDirectory}
                  className="status-button"
                >
                  Đổi thư mục
                </button>
              </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleMainAction}
              disabled={isInstalling || isGameLoading || (hasGame && !selectedVersion) || false}
              className="main-action-button"
            >
              {getMainButtonIcon()}
              {getMainButtonText()}
            </button>

            {/* Progress Bar */}
            {isInstalling && (
              <div className="progress-card">
                <div className="progress-info">
                  <p className="progress-message">{progress.message}</p>
                  <p className="progress-percent">{Math.round(progress.progress)}%</p>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Version Selector & News */}
        <div className="main-screen-bottom">
          {/* Version Selector */}
          {hasGame && pack && pack.versions.length > 0 && (
            <div className="version-selector">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="version-selector-button"
              >
                <div className="version-selector-left">
                  <Download className="version-icon" />
                  <div className="version-info">
                    <p className="version-label">Phiên bản</p>
                    <p className="version-value">
                      {selectedVersion?.version || pack.latest_version}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`version-chevron ${showVersions ? 'open' : ''}`} />
              </button>

              {showVersions && (
                <div className="version-list">
                  {pack.versions.map((version: TranslationVersion) => {
                    const isSelected = selectedVersion?.version === version.version;
                    const isCurrent = currentInfo?.version === version.version;

                    return (
                      <button
                        key={version.version}
                        onClick={() => {
                          setSelectedVersion(version);
                          setShowVersions(false);
                        }}
                        className={`version-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="version-item-header">
                          <span className="version-name">{version.version}</span>
                          {isCurrent && (
                            <span className="version-badge">Đã cài</span>
                          )}
                        </div>
                        <div className="version-meta">
                          <span>{formatDate(version.release_date)}</span>
                          <span>•</span>
                          <span>{formatBytes(version.file_size)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* News/Info Card */}
          <div className="info-card">
            <div className="info-card-header">
              <Calendar className="info-icon" />
              <div>
                <p className="info-card-label">Thông báo</p>
                <p className="info-card-title">Chào mừng!</p>
              </div>
            </div>
            <p className="info-card-text">
              Công cụ cài đặt bản việt hóa cho Princess Connect Re:Dive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
