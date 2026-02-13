import { useState, useEffect } from "react";
import { Download, Play, FolderOpen, MoreVertical, Settings, X, Minus } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useGamePath } from "../../hooks/useGamePath";
import { useTranslation } from "../../hooks/useTranslation";
import { formatBytes } from "../../lib/api";
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

  const handleDragStart = async () => {
    const window = getCurrentWindow();
    await window.startDragging();
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
    if (isInstalling) return "Đang cài đặt...";
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
    <div className="main-screen">
      {/* Hero Section */}
      <div className="hero-section">
        <img 
          src="/hero.jpg" 
          alt="Princess Connect" 
          className="hero-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Drag Bar */}
      <div className="drag-bar" onMouseDown={handleDragStart} />

      {/* Window Controls */}
      <div className="window-controls">
        <button onClick={onOpenSettings} className="control-btn">
          <Settings />
        </button>
        <button onClick={handleMinimize} className="control-btn">
          <Minus />
        </button>
        <button onClick={handleClose} className="control-btn control-close">
          <X />
        </button>
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        {/* Title Section */}
        <div className={`title-section ${isInstalling ? 'compact' : ''}`}>
          <h1 className="panel-title">Trình cài đặt việt hóa Priconne</h1>
          <p className="panel-subtitle">Princess Connect! Re:Dive</p>
        </div>

        {/* Progress */}
        {isInstalling && (
          <div className="progress-container">
            <div className="progress-info">
              <span className="progress-message">{progress.message}</span>
              <span className="progress-percent">{Math.round(progress.progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
            </div>
          </div>
        )}

        {/* Version Selector */}
        {hasGame && pack && pack.versions.length > 0 && !isInstalling && (
          <div className="version-selector">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="version-button"
            >
              Phiên bản {selectedVersion?.version || pack.latest_version}
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
                      className={`version-option ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="version-name">{version.version}</span>
                      {isCurrent && <span className="version-badge">Đã cài</span>}
                      <span className="version-size">{formatBytes(version.file_size)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={handleMainAction}
            disabled={isInstalling || isGameLoading || (hasGame && !selectedVersion) || false}
            className="main-button"
          >
            {getMainButtonIcon()}
            <span>{getMainButtonText()}</span>
          </button>

          <div className="menu-container">
            <button
              onClick={() => setShowGameMenu(!showGameMenu)}
              className="menu-button"
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
                  className="game-menu-item"
                >
                  <FolderOpen />
                  <span>{hasGame ? 'Đổi thư mục' : 'Chọn thư mục'}</span>
                </button>
                {hasGame && (
                  <div className="game-menu-path">
                    <span className="path-label">Đường dẫn:</span>
                    <p className="path-text">{gamePath}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
