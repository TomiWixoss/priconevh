import { useState, useEffect } from "react";
import { Download, Play, FolderOpen, MoreVertical, Settings } from "lucide-react";
import { useGamePath } from "../../hooks/useGamePath";
import { useTranslation } from "../../hooks/useTranslation";
import { formatBytes, formatDate } from "../../lib/api";
import type { TranslationVersion } from "../../types";
import "./MainScreen.css";

interface MainScreenProps {
  gamePathHook: ReturnType<typeof useGamePath>;
  translationHook: ReturnType<typeof useTranslation>;
  onOpenSettings: () => void;
}

export function MainScreen({ gamePathHook, translationHook, onOpenSettings }: MainScreenProps) {
  const { gamePath, gameInfo, isLoading: isGameLoading, autoDetectGame, selectGameDirectory } = gamePathHook;
  const { pack, currentInfo, isLoading: _isTranslationLoading, isInstalling, progress, loadPack, install, update, loadCurrentInfo } = translationHook;

  const [showVersions, setShowVersions] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
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
    if (!hasGame) return "Chọn thư mục game";
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return "Tải game";
    if (hasTranslation && currentInfo?.version !== selectedVersion?.version) return "Cập nhật";
    return "Cài đặt";
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
      <div className="main-screen-content-new">
        {/* Top Left - Logo & Title */}
        <div className="game-logo-section">
          <div className="game-logo-card">
            <div className="game-logo-image">
              <div className="game-logo-placeholder">
                <span style={{ fontSize: 32, fontWeight: 900 }}>PC</span>
              </div>
            </div>
            <div className="game-info-text">
              <h2 className="game-title">PRINCESS CONNECT</h2>
              <p className="game-subtitle">Re:Dive</p>
              <div className="game-release-badge">
                <span>OFFICIAL RELEASE</span>
              </div>
              <p className="game-release-date">2026.01.22</p>
            </div>
          </div>
        </div>

        {/* Bottom Right - Action Buttons */}
        <div className="action-buttons-section">
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="settings-fab"
            title="Cài đặt"
          >
            <Settings style={{ width: 24, height: 24 }} />
          </button>

          {/* Version Selector (if game is installed) */}
          {hasGame && pack && pack.versions.length > 0 && (
            <div className="version-selector-compact">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="version-selector-compact-button"
              >
                <span className="version-text">
                  {selectedVersion?.version || pack.latest_version}
                </span>
              </button>

              {showVersions && (
                <div className="version-dropdown">
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
                        className={`version-dropdown-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="version-dropdown-header">
                          <span className="version-dropdown-name">{version.version}</span>
                          {isCurrent && (
                            <span className="version-dropdown-badge">Đã cài</span>
                          )}
                        </div>
                        <div className="version-dropdown-meta">
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

          {/* Main Action Button Group */}
          <div className="main-action-group">
            <button
              onClick={handleMainAction}
              disabled={isInstalling || isGameLoading || (hasGame && !selectedVersion) || false}
              className="main-action-button-new"
            >
              {getMainButtonIcon()}
              <span>{getMainButtonText()}</span>
            </button>

            {/* Game Menu Button (3 dots) */}
            <div className="game-menu-container">
              <button
                onClick={() => setShowGameMenu(!showGameMenu)}
                className="game-menu-button"
                disabled={isInstalling}
              >
                <MoreVertical style={{ width: 24, height: 24 }} />
              </button>

              {showGameMenu && (
                <div className="game-menu-dropdown">
                  <button
                    onClick={() => {
                      selectGameDirectory();
                      setShowGameMenu(false);
                    }}
                    className="game-menu-item"
                  >
                    <FolderOpen style={{ width: 18, height: 18 }} />
                    <span>{hasGame ? 'Đổi thư mục game' : 'Chọn thư mục game'}</span>
                  </button>
                  {hasGame && (
                    <div className="game-menu-info">
                      <p className="game-menu-info-label">Đường dẫn hiện tại:</p>
                      <p className="game-menu-info-path">{gamePath}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isInstalling && (
            <div className="progress-card-new">
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
    </div>
  );
}
