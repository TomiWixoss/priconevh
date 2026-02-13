import { useState, useEffect } from "react";
import { Download, Play, FolderOpen, MoreVertical, Settings, X, Minus } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
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

  const handleMinimize = async () => {
    const window = getCurrentWindow();
    await window.minimize();
  };

  const handleClose = async () => {
    const window = getCurrentWindow();
    await window.close();
  };

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
    if (!hasGame) return <FolderOpen />;
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return <Play />;
    return <Download />;
  };

  return (
    <div className="main-screen" data-tauri-drag-region>
      {/* Hero Background */}
      <div className="hero-bg">
        <img 
          src="/hero.jpg" 
          alt="Princess Connect" 
          className="hero-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Window Controls - Top Right */}
      <div className="window-controls">
        <button onClick={onOpenSettings} className="control-btn" title="Cài đặt">
          <Settings />
        </button>
        <button onClick={handleMinimize} className="control-btn" title="Thu nhỏ">
          <Minus />
        </button>
        <button onClick={handleClose} className="control-btn close-btn" title="Đóng">
          <X />
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Logo & Title - Top Left */}
        <div className="game-info">
          <div className="logo">PC</div>
          <div className="info-text">
            <h1 className="title">PRINCESS CONNECT</h1>
            <p className="subtitle">Re:Dive</p>
            <div className="meta">
              <span className="badge">OFFICIAL RELEASE</span>
              <span className="date">2026.01.22</span>
            </div>
          </div>
        </div>

        {/* Actions - Bottom Right */}
        <div className="actions">
          {/* Version Selector */}
          {hasGame && pack && pack.versions.length > 0 && (
            <div className="version-selector">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="version-btn"
              >
                {selectedVersion?.version || pack.latest_version}
              </button>

              {showVersions && (
                <div className="version-menu">
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
                        <div className="version-header">
                          <span className="version-name">{version.version}</span>
                          {isCurrent && <span className="current-badge">Đã cài</span>}
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

          {/* Main Button Group */}
          <div className="btn-group">
            <button
              onClick={handleMainAction}
              disabled={isInstalling || isGameLoading || (hasGame && !selectedVersion) || false}
              className="main-btn"
            >
              {getMainButtonIcon()}
              <span>{getMainButtonText()}</span>
            </button>

            {/* Game Menu */}
            <div className="menu-wrapper">
              <button
                onClick={() => setShowGameMenu(!showGameMenu)}
                className="menu-btn"
                disabled={isInstalling}
              >
                <MoreVertical />
              </button>

              {showGameMenu && (
                <div className="game-menu">
                  <button
                    onClick={() => {
                      selectGameDirectory();
                      setShowGameMenu(false);
                    }}
                    className="menu-item"
                  >
                    <FolderOpen />
                    <span>{hasGame ? 'Đổi thư mục game' : 'Chọn thư mục game'}</span>
                  </button>
                  {hasGame && (
                    <div className="menu-info">
                      <p className="menu-label">Đường dẫn:</p>
                      <p className="menu-path">{gamePath}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {isInstalling && (
            <div className="progress">
              <div className="progress-text">
                <span className="progress-msg">{progress.message}</span>
                <span className="progress-pct">{Math.round(progress.progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
