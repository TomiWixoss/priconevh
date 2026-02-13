import { useState, useEffect } from "react";
import { Download, Upload, Trash2, History, Loader2, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/api";
import type { TranslationVersion } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface TranslationProps {
  hook: ReturnType<typeof useTranslation>;
  gamePath: string | null;
}

export function Translation({ hook, gamePath }: TranslationProps) {
  const {
    pack,
    currentInfo,
    isLoading,
    isInstalling,
    progress,
    loadPack,
    install,
    update,
    uninstall,
  } = hook;

  const [selectedVersion, setSelectedVersion] = useState<TranslationVersion | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (gamePath) {
      loadPack();
    }
  }, [gamePath]);

  useEffect(() => {
    if (pack && pack.versions.length > 0 && !selectedVersion) {
      setSelectedVersion(pack.versions[0]);
      setExpandedVersion(pack.versions[0].version);
    }
  }, [pack]);

  const handleInstall = async () => {
    if (!gamePath || !selectedVersion) return;
    
    const isUpdate = currentInfo && currentInfo.version !== selectedVersion.version;
    
    if (isUpdate) {
      await update(gamePath, selectedVersion);
    } else {
      await install(gamePath, selectedVersion);
    }
  };

  const handleUninstall = async () => {
    if (!gamePath) return;
    await uninstall(gamePath);
  };

  if (!gamePath) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 border border-[hsl(var(--glass-border))] text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Chưa cấu hình thư mục game</h3>
          <p className="text-gray-400">Vui lòng cấu hình thư mục game trước khi cài đặt việt hóa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quản lý việt hóa</h1>
          <p className="text-gray-400">Cài đặt, cập nhật hoặc gỡ bỏ bản việt hóa game</p>
        </div>

        {isLoading && (
          <div className="glass-effect rounded-2xl p-12 border border-[hsl(var(--glass-border))] text-center">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-white">Đang tải thông tin bản việt hóa...</p>
          </div>
        )}

        {!isLoading && pack && (
          <div className="space-y-6">
            {/* Current Translation Info */}
            {currentInfo && (
              <div className="glass-effect rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Bản việt hóa hiện tại</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Phiên bản {currentInfo.version} • Cài đặt {formatDate(currentInfo.installed_date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUninstall}
                    disabled={isInstalling}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Gỡ bỏ
                  </button>
                </div>
              </div>
            )}

            {/* Version List */}
            <div className="glass-effect rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
              <div className="p-6 border-b border-[hsl(var(--glass-border))]">
                <h3 className="text-lg font-semibold text-white mb-1">Các phiên bản có sẵn</h3>
                <p className="text-sm text-gray-400">
                  {pack.versions.length} phiên bản • Mới nhất: {pack.latest_version}
                </p>
              </div>

              <div className="divide-y divide-[hsl(var(--glass-border))]">
                {pack.versions.map((version: TranslationVersion) => {
                  const isSelected = selectedVersion?.version === version.version;
                  const isCurrent = currentInfo?.version === version.version;
                  const isExpanded = expandedVersion === version.version;

                  return (
                    <div
                      key={version.version}
                      className={`transition-all ${
                        isSelected ? 'bg-yellow-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => {
                          setSelectedVersion(version);
                          setExpandedVersion(isExpanded ? null : version.version);
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-semibold">
                              {version.version}
                            </span>
                            {isCurrent && (
                              <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                                Đã cài
                              </span>
                            )}
                            {!isCurrent && version.version === pack.latest_version && (
                              <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium">
                                Mới nhất
                              </span>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            {formatDate(version.release_date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            {formatBytes(version.file_size)}
                          </div>
                        </div>

                        {isExpanded && version.changelog.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-[hsl(var(--glass-border))]">
                            <p className="text-sm font-medium text-white mb-2">Thay đổi:</p>
                            <ul className="space-y-1">
                              {version.changelog.map((line: string, i: number) => (
                                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                  <span className="text-yellow-400 mt-1">•</span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-4">
              <button
                onClick={handleInstall}
                disabled={!selectedVersion || isInstalling || (currentInfo?.version === selectedVersion?.version)}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 disabled:text-gray-400 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isInstalling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang cài đặt...
                  </>
                ) : currentInfo?.version === selectedVersion?.version ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Đã cài đặt
                  </>
                ) : currentInfo && currentInfo.version !== selectedVersion?.version ? (
                  <>
                    <Upload className="w-5 h-5" />
                    Cập nhật lên {selectedVersion?.version}
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Cài đặt {selectedVersion?.version}
                  </>
                )}
              </button>
            </div>

            {/* Progress */}
            {isInstalling && (
              <div className="glass-effect rounded-2xl p-6 border border-[hsl(var(--glass-border))]">
                <div className="mb-3">
                  <p className="text-white font-medium mb-1">{progress.message}</p>
                  <p className="text-sm text-gray-400">{Math.round(progress.progress)}%</p>
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
        )}
      </div>
    </div>
  );
}