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
    <div className="screen">
      {/* Drag Region - Top area for dragging window */}
      <div className="drag-region" data-tauri-drag-region />

      {/* Hero Background */}
      <div className="hero">
        <img 
          src="/hero.jpg" 
          alt="Princess Connect" 
          className="hero-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="hero-overlay" />
      </div>

      {/* Window Controls */}
      <div className="controls">
        <button onClick={onOpenSettings} className="ctrl-btn">
          <Settings />
        </button>
        <button onClick={handleMinimize} className="ctrl-btn">
          <Minus />
        </button>
        <button onClick={handleClose} className="ctrl-btn close">
          <X />
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Title */}
        <div className="header">
          <h1 className="title">Trình cài đặt việt hóa Priconne</h1>
        </div>

        {/* Actions */}
        <div className="actions">
          {/* Version Selector */}
          {hasGame && pack && pack.versions.length > 0 && (
            <div className="version-wrap">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="version-btn"
              >
                <span>Phiên bản: {selectedVersion?.version || pack.latest_version}</span>
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
                        className={`version-item ${isSelected ? 'active' : ''}`}
                      >
                        <div className="v-header">
                          <span className="v-name">{version.version}</span>
                          {isCurrent && <span className="v-badge">Đã cài</span>}
                        </div>
                        <div className="v-meta">
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
            <div className="menu-wrap">
              <button
                onClick={() => setShowGameMenu(!showGameMenu)}
                className="menu-btn"
                disabled={isInstalling}
              >
                <MoreVertical />
              </button>

              {showGameMenu && (
                <div className="menu">
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
            <div className="progress-wrap">
              <div className="progress-text">
                <span>{progress.message}</span>
                <span>{Math.round(progress.progress)}%</span>
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
