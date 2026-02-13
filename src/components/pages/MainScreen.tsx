import { useState, useEffect } from "react";
import { Download, Play, FolderOpen, CheckCircle, AlertCircle, ChevronDown, Calendar } from "lucide-react";
import { useGamePath } from "@/hooks/useGamePath";
import { useTranslation } from "@/hooks/useTranslation";
import { formatBytes, formatDate } from "@/lib/api";
import type { TranslationVersion } from "@/types";

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
      // Chọn thư mục game
      await selectGameDirectory();
      return;
    }

    if (!selectedVersion || !gamePath) return;

    // Cài đặt hoặc cập nhật việt hóa
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
    if (!hasGame) return <FolderOpen className="w-6 h-6" />;
    if (hasTranslation && currentInfo?.version === selectedVersion?.version) return <Play className="w-6 h-6 fill-current" />;
    return <Download className="w-6 h-6" />;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img 
          src="/hero.jpg" 
          alt="Princess Connect" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--background))]/60 to-[hsl(var(--background))]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--background))]/80 via-transparent to-[hsl(var(--background))]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        {/* Top Section - Title & Info */}
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl">
            {/* Title */}
            <div className="mb-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/30 mb-4">
                <span className="text-yellow-400 text-sm font-semibold">OFFICIAL RELEASE</span>
              </div>
              <h1 className="text-7xl font-black mb-4 text-white drop-shadow-2xl leading-tight">
                PRINCESS<br/>CONNECT
              </h1>
              <p className="text-3xl font-bold text-yellow-400 mb-4">Re:Dive</p>
              <p className="text-lg text-gray-300">Bản việt hóa chính thức</p>
            </div>

            {/* Status Info */}
            {hasGame && (
              <div className="glass-effect rounded-xl p-4 border border-[hsl(var(--glass-border))] mb-6 max-w-md">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasTranslation ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    {hasTranslation ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Trạng thái</p>
                    <p className="text-sm text-white font-medium">
                      {hasTranslation 
                        ? `Đã cài việt hóa ${currentInfo?.version || ''}` 
                        : 'Chưa cài việt hóa'}
                    </p>
                  </div>
                  <button
                    onClick={selectGameDirectory}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-all"
                  >
                    Đổi thư mục
                  </button>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleMainAction}
              disabled={isInstalling || isGameLoading || (hasGame && !selectedVersion) || false}
              className="h-16 px-12 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 disabled:text-gray-400 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-2xl hover:shadow-yellow-500/50 glow-effect disabled:shadow-none disabled:cursor-not-allowed"
            >
              {getMainButtonIcon()}
              {getMainButtonText()}
            </button>

            {/* Progress Bar */}
            {isInstalling && (
              <div className="glass-effect rounded-xl p-4 border border-[hsl(var(--glass-border))] mt-4 max-w-md">
                <div className="mb-2">
                  <p className="text-white text-sm font-medium mb-1">{progress.message}</p>
                  <p className="text-xs text-gray-400">{Math.round(progress.progress)}%</p>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Version Selector & News */}
        <div className="grid grid-cols-2 gap-4">
          {/* Version Selector */}
          {hasGame && pack && pack.versions.length > 0 && (
            <div className="glass-effect rounded-xl border border-[hsl(var(--glass-border))] overflow-hidden">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-yellow-400" />
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Phiên bản</p>
                    <p className="text-sm text-white font-medium">
                      {selectedVersion?.version || pack.latest_version}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showVersions ? 'rotate-180' : ''}`} />
              </button>

              {showVersions && (
                <div className="border-t border-[hsl(var(--glass-border))] max-h-48 overflow-y-auto">
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
                        className={`w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-[hsl(var(--glass-border))] last:border-b-0 ${
                          isSelected ? 'bg-yellow-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white font-medium">{version.version}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
                              Đã cài
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
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
          <div className="glass-effect rounded-xl p-4 border border-[hsl(var(--glass-border))]">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Thông báo</p>
                <p className="text-sm text-white font-medium">Chào mừng!</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Công cụ cài đặt bản việt hóa cho Princess Connect Re:Dive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
