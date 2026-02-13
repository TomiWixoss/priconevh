import { ArrowRight, Download, Settings, Gamepad2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGamePath } from "@/hooks/useGamePath";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardProps {
  gamePathHook: ReturnType<typeof useGamePath>;
  translationHook: ReturnType<typeof useTranslation>;
  onNavigate: (page: "dashboard" | "game-path" | "translation" | "settings") => void;
}

export function Dashboard({ gamePathHook, translationHook, onNavigate }: DashboardProps) {
  const { gamePath, gameInfo, isLoading: isGameLoading } = gamePathHook;
  const { latestVersion, isInstalling, progress } = translationHook;

  const hasGame = gamePath && gameInfo?.is_valid;
  const hasTranslation = gameInfo?.has_translation;
  const needsUpdate = hasTranslation && latestVersion && gameInfo?.translation_version !== latestVersion;

  return (
    <div className="dashboard">
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Trạng thái hệ thống</h2>
        </div>
        
        <div className="status-grid">
          <Card className="status-card">
            <CardContent className="status-content">
              <div className="status-icon game">
                <Gamepad2 className="icon" />
              </div>
              <div className="status-info">
                <div className="status-label">Thư mục game</div>
                {isGameLoading ? (
                  <div className="status-value loading">Đang kiểm tra...</div>
                ) : hasGame ? (
                  <div className="status-value success">
                    <CheckCircle className="status-check" />
                    Đã tìm thấy
                  </div>
                ) : (
                  <div className="status-value warning">
                    <AlertCircle className="status-check" />
                    Chưa cấu hình
                  </div>
                )}
              </div>
            </CardContent>
            {!hasGame && (
              <Button
                variant="outline"
                size="sm"
                className="status-action"
                onClick={() => onNavigate("game-path")}
              >
                Cấu hình ngay
                <ArrowRight className="icon-sm" />
              </Button>
            )}
          </Card>

          <Card className="status-card">
            <CardContent className="status-content">
              <div className="status-icon translation">
                <Download className="icon" />
              </div>
              <div className="status-info">
                <div className="status-label">Bản việt hóa</div>
                {isGameLoading ? (
                  <div className="status-value loading">Đang kiểm tra...</div>
                ) : hasTranslation ? (
                  <div className="status-value success">
                    <CheckCircle className="status-check" />
                    Đã cài đặt {gameInfo?.translation_version && `v${gameInfo.translation_version}`}
                  </div>
                ) : (
                  <div className="status-value warning">
                    <AlertCircle className="status-check" />
                    Chưa cài đặt
                  </div>
                )}
              </div>
            </CardContent>
            {hasGame && !hasTranslation && (
              <Button
                variant="default"
                size="sm"
                className="status-action"
                onClick={() => onNavigate("translation")}
              >
                Cài đặt việt hóa
                <ArrowRight className="icon-sm" />
              </Button>
            )}
            {needsUpdate && (
              <Button
                variant="default"
                size="sm"
                className="status-action update"
                onClick={() => onNavigate("translation")}
              >
                Cập nhật ngay
                <ArrowRight className="icon-sm" />
              </Button>
            )}
          </Card>
        </div>
      </section>

      {isInstalling && (
        <section className="dashboard-section">
          <Card className="progress-card">
            <CardHeader>
              <CardTitle>Đang cài đặt bản việt hóa</CardTitle>
              <CardDescription>{progress.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress.progress} className="progress-bar" />
              <div className="progress-text">{Math.round(progress.progress)}%</div>
            </CardContent>
          </Card>
        </section>
      )}

      {hasGame && !isInstalling && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Thao tác nhanh</h2>
          </div>
          
          <div className="quick-actions">
            <Button
              variant="outline"
              className="quick-action"
              onClick={() => onNavigate("translation")}
            >
              <Download className="icon" />
              <span>Quản lý việt hóa</span>
            </Button>
            
            <Button
              variant="outline"
              className="quick-action"
              onClick={() => onNavigate("settings")}
            >
              <Settings className="icon" />
              <span>Cài đặt</span>
            </Button>
          </div>
        </section>
      )}

      {!hasGame && (
        <section className="dashboard-section">
          <Card className="welcome-card">
            <CardHeader>
              <CardTitle>Chào mừng đến với Priconne VN Installer!</CardTitle>
              <CardDescription>
                Hãy bắt đầu bằng cách cấu hình thư mục game của bạn để có thể cài đặt bản việt hóa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={() => onNavigate("game-path")}>
                <Gamepad2 className="icon" />
                Cấu hình thư mục game
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}