import { useState, useEffect } from "react";
import { Download, Upload, Trash2, History, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  useEffect(() => {
    if (gamePath) {
      loadPack();
    }
  }, [gamePath]);

  useEffect(() => {
    if (pack && pack.versions.length > 0 && !selectedVersion) {
      setSelectedVersion(pack.versions[0]);
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
      <Card className="empty-card">
        <CardContent>
          <AlertCircle className="empty-icon" />
          <p>Vui lòng cấu hình thư mục game trước</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="translation-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý việt hóa</h1>
        <p className="page-description">
          Cài đặt, cập nhật hoặc gỡ bỏ bản việt hóa game
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="loading-state">
            <Loader2 className="loading-icon" />
            <p>Đang tải thông tin bản việt hóa...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && pack && (
        <>
          {/* Current translation info */}
          {currentInfo && (
            <Card className="current-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="icon-success" />
                  Bản việt hóa hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="current-info">
                  <div className="info-row">
                    <span className="info-label">Phiên bản</span>
                    <span className="info-value">{currentInfo.version}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày cài đặt</span>
                    <span className="info-value">{formatDate(currentInfo.installed_date)}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="uninstall-btn"
                  onClick={handleUninstall}
                  disabled={isInstalling}
                >
                  <Trash2 className="icon" />
                  Gỡ bỏ bản việt hóa
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Version selection */}
          <Card className="versions-card">
            <CardHeader>
              <CardTitle>Các phiên bản có sẵn</CardTitle>
              <CardDescription>
                {pack.versions.length} phiên bản | Phiên bản mới nhất: {pack.latest_version}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="versions-list">
                {pack.versions.map((version: TranslationVersion) => {
                  const isSelected = selectedVersion?.version === version.version;
                  const isCurrent = currentInfo?.version === version.version;
                  const isNewer = currentInfo && version.version !== currentInfo.version;

                  return (
                    <div
                      key={version.version}
                      className={`version-item ${isSelected ? "selected" : ""} ${isCurrent ? "current" : ""}`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="version-header">
                        <span className="version-badge">{version.version}</span>
                        {isCurrent && (
                          <span className="current-badge">Đã cài</span>
                        )}
                        {isNewer && !isCurrent && (
                          <span className="update-badge">Cập nhật</span>
                        )}
                      </div>
                      
                      <div className="version-meta">
                        <span className="meta-item">
                          <History className="meta-icon" />
                          {formatDate(version.release_date)}
                        </span>
                        <span className="meta-item">
                          {formatBytes(version.file_size)}
                        </span>
                      </div>

                      {version.changelog.length > 0 && (
                        <div className="version-changelog">
                          {version.changelog.slice(0, 3).map((line: string, i: number) => (
                            <p key={i} className="changelog-line">• {line}</p>
                          ))}
                          {version.changelog.length > 3 && (
                            <p className="changelog-more">
                              +{version.changelog.length - 3} thay đổi khác
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="version-actions">
                <Button
                  size="lg"
                  onClick={handleInstall}
                  disabled={!selectedVersion || isInstalling || (currentInfo?.version === selectedVersion?.version)}
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="icon animate-spin" />
                      Đang cài đặt...
                    </>
                  ) : currentInfo?.version === selectedVersion?.version ? (
                    <>
                      <CheckCircle className="icon" />
                      Đã cài đặt
                    </>
                  ) : currentInfo && currentInfo.version !== selectedVersion?.version ? (
                    <>
                      <Upload className="icon" />
                      Cập nhật
                    </>
                  ) : (
                    <>
                      <Download className="icon" />
                      Cài đặt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {isInstalling && (
            <Card className="progress-card">
              <CardHeader>
                <CardTitle>{progress.message}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress.progress} className="progress-bar" />
                <div className="progress-text">{Math.round(progress.progress)}%</div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}