import { useState, useEffect } from "react";
import { Download, FolderOpen, Settings, ChevronDown, Loader2, Star, Github, Facebook, MessageCircle } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-shell";
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
  const { gamePath, gameInfo, isLoading: isGameLoading, error: gameError, autoDetectGame, selectGameDirectory } = gamePathHook;
  const { pack, currentInfo, isLoading: _isTranslationLoading, isInstalling, progress, loadPack, install, update, uninstall, loadCurrentInfo } = translationHook;

  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<TranslationVersion | null>(null);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);

  const hasGame = gamePath && gameInfo?.is_valid;
  const hasTranslation = gameInfo?.has_translation;

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

  const handleUninstall = async () => {
    if (!gamePath) return;
    
    setShowUninstallConfirm(false);
    await uninstall(gamePath);
  };

  const openLink = async (url: string) => {
    try {
      await open(url);
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  const getMainButtonText = () => {
    if (isInstalling) {
      // Check progress message để phân biệt đang cài hay đang gỡ
      if (progress.message.includes("gỡ")) return "Đang gỡ bỏ...";
      return "Đang cài đặt...";
    }
    if (isGameLoading) return "Đang tìm game...";
    if (!hasGame) return "Chọn thư mục game";
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return "Cài lại";
    if (hasTranslation && currentInfo?.version !== selectedVersion?.version) return "Cập nhật";
    return "Cài đặt";
  };

  const getMainButtonIcon = () => {
    if (isInstalling || isGameLoading) return <Loader2 size={20} className="btn-icon spinning" />;
    if (!hasGame) return <FolderOpen size={20} />;
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return <Download size={20} />;
    if (hasTranslation && currentInfo?.version !== selectedVersion?.version) return <Download size={20} />;
    return <Download size={20} />;
  };

  return (
    <div className="main-screen">
      {/* Background with gradient overlay */}
      <div className="bg-layer">
        <div className="bg-gradient bg-gradient-1" />
        <div className="bg-gradient bg-gradient-2" />
        <div className="bg-gradient bg-gradient-3" />
        <div className="bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Hero Image */}
      <div className="hero-section">
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

      {/* Top Bar */}
      <div className="top-bar">
        <div className="drag-area" onMouseDown={handleDragStart} />
        <div className="window-controls">
          <button onClick={onOpenSettings} className="control-btn" title="Cài đặt">
            <Settings size={16} />
          </button>
          <button onClick={handleMinimize} className="control-btn" title="Thu nhỏ">
            <span className="minimize-icon">−</span>
          </button>
          <button onClick={handleClose} className="control-btn control-close" title="Đóng">
            <span className="close-icon">×</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Title with decorative elements */}
        <div className="title-area">
          <div className="title-decoration">
            <Star className="star-icon star-1" size={24} />
            <Star className="star-icon star-2" size={16} />
            <Star className="star-icon star-3" size={20} />
          </div>
          <h1 className="app-title">
            <span className="title-highlight">Princess Connect!</span> Re:Dive
          </h1>
          <p className="app-subtitle">Trình cài đặt việt hóa</p>
        </div>

        {/* Glass Panel */}
        <div className="glass-panel">
          {/* Game Path Section */}
          <div className="path-section">
            <div className="path-header">
              <FolderOpen size={18} />
              <span>Thư mục game</span>
            </div>
            <div className="path-content">
              <p className="path-value">
                {isGameLoading 
                  ? "Đang tìm kiếm thư mục game..." 
                  : hasGame 
                    ? gamePath 
                    : gameError || "Vui lòng chọn thư mục game"}
              </p>
              <button 
                onClick={selectGameDirectory}
                className="path-btn"
                disabled={isInstalling || isGameLoading}
              >
                {hasGame ? "Đổi" : "Chọn"}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="panel-divider">
            <div className="divider-line" />
          </div>

          {/* Current Translation Info */}
          {hasGame && hasTranslation && currentInfo && (
            <div className="current-translation-section">
              <div className="current-translation-header">
                <span className="current-translation-label">Phiên bản hiện tại</span>
                <button 
                  onClick={() => setShowUninstallConfirm(true)}
                  className="uninstall-btn"
                  disabled={isInstalling}
                  title="Gỡ bản việt hóa"
                >
                  Gỡ bỏ
                </button>
              </div>
              <div className="current-translation-info">
                <div className="current-version-badge">
                  <span className="current-version-text">{currentInfo.version}</span>
                </div>
                <span className="current-install-date">
                  Cài đặt: {new Date(currentInfo.installed_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          )}

          {/* Divider */}
          {hasGame && hasTranslation && currentInfo && pack && pack.versions.length > 0 && (
            <div className="panel-divider">
              <div className="divider-line" />
            </div>
          )}

          {/* Version Selector */}
          {hasGame && pack && pack.versions.length > 0 && (
            <div className="version-section">
              <div className="version-header">
                <span className="version-label">Chọn phiên bản</span>
                <span className="version-latest">
                  Mới nhất: {pack.latest_version}
                </span>
              </div>
              <div className="version-dropdown-wrapper">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="version-select"
                >
                  <div className="version-select-content">
                    <span className="version-text">
                      {selectedVersion?.version || pack.latest_version}
                    </span>
                    {selectedVersion && (
                      <span className="version-size">
                        {formatBytes(selectedVersion.file_size)}
                      </span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`chevron ${showVersions ? 'open' : ''}`} />
                </button>

                {showVersions && (
                  <div className="version-dropdown glass-dropdown">
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
                          <div className="version-info">
                            <span className="version-name">{version.version}</span>
                            {isCurrent && <span className="version-badge">Đã cài</span>}
                            <span className="version-size">{formatBytes(version.file_size)}</span>
                            <span className="version-downloads">
                              <Download size={14} /> {version.download_count.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {isInstalling && (
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-message">{progress.message}</span>
                <span className="progress-percent">{Math.round(progress.progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
              </div>
            </div>
          )}

          {/* Main Action Button */}
          <button
            onClick={handleMainAction}
            disabled={!!(isInstalling || isGameLoading || (hasGame && !selectedVersion))}
            className={`main-button ${!hasGame ? 'select-path' : ''} ${hasTranslation && currentInfo?.version === selectedVersion?.version ? 'reinstall' : ''}`}
          >
            {getMainButtonIcon()}
            <span>{getMainButtonText()}</span>
          </button>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />

      {/* Social Links */}
      <div className="social-links">
        <button 
          onClick={() => openLink('https://github.com/TomiWixoss')}
          className="social-btn"
          title="GitHub"
        >
          <Github size={20} />
        </button>
        <button 
          onClick={() => openLink('https://www.facebook.com/profile.php?id=61588049007707')}
          className="social-btn"
          title="Facebook"
        >
          <Facebook size={20} />
        </button>
        <button 
          onClick={() => openLink('https://zalo.me/0762605309')}
          className="social-btn"
          title="Zalo"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {/* Uninstall Confirmation Dialog */}
      {showUninstallConfirm && (
        <div className="confirm-overlay" onClick={() => setShowUninstallConfirm(false)}>
          <div className="confirm-dialog glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">Xác nhận gỡ bỏ</h3>
            <p className="confirm-message">
              Bạn có chắc muốn gỡ bỏ bản việt hóa? 
              <br />
              Dữ liệu cũ sẽ được backup vào thư mục <code>translation_backup</code>.
            </p>
            <div className="confirm-actions">
              <button 
                onClick={() => setShowUninstallConfirm(false)} 
                className="confirm-btn confirm-cancel"
              >
                Hủy
              </button>
              <button 
                onClick={handleUninstall} 
                className="confirm-btn confirm-danger"
              >
                Gỡ bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}