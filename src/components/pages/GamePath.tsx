import { useEffect } from "react";
import { FolderOpen, Search, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGamePath } from "@/hooks/useGamePath";

interface GamePathProps {
  hook: ReturnType<typeof useGamePath>;
}

export function GamePath({ hook }: GamePathProps) {
  const {
    gamePath,
    gameInfo,
    isLoading,
    error,
    autoDetectGame,
    selectGameDirectory,
  } = hook;

  useEffect(() => {
    if (!gamePath) {
      autoDetectGame();
    }
  }, []);

  return (
    <div className="game-path-page">
      <div className="page-header">
        <h1 className="page-title">Thư mục game</h1>
        <p className="page-description">
          Cấu hình thư mục cài đặt Princess Connect Re:Dive để có thể cài đặt bản việt hóa
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="loading-state">
            <Loader2 className="loading-icon" />
            <p>Đang tìm kiếm thư mục game...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && gameInfo?.is_valid && gamePath && (
        <Card className="success-card">
          <CardHeader>
            <div className="success-header">
              <CheckCircle className="success-icon" />
              <CardTitle>Đã tìm thấy game!</CardTitle>
            </div>
            <CardDescription>Thư mục game hợp lệ và sẵn sàng</CardDescription>
          </CardHeader>
          <CardContent className="success-content">
            <div className="path-display">
              <FolderOpen className="path-icon" />
              <code className="path-text">{gamePath}</code>
            </div>

            <div className="game-info-grid">
              {gameInfo.version && (
                <div className="info-item">
                  <span className="info-label">Phiên bản game</span>
                  <span className="info-value">{gameInfo.version}</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">Trạng thái</span>
                <span className="info-value success">Hợp lệ</span>
              </div>

              {gameInfo.has_translation && (
                <div className="info-item">
                  <span className="info-label">Bản việt hóa</span>
                  <span className="info-value">
                    {gameInfo.translation_version || "Đã cài"}
                  </span>
                </div>
              )}
            </div>

            <div className="action-buttons">
              <Button
                variant="outline"
                onClick={selectGameDirectory}
              >
                <FolderOpen className="icon" />
                Chọn thư mục khác
              </Button>
              
              <Button
                variant="ghost"
                onClick={autoDetectGame}
              >
                <RefreshCw className="icon" />
                Tìm lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && (!gameInfo?.is_valid || !gamePath) && (
        <Card className="not-found-card">
          <CardHeader>
            <div className="not-found-header">
              <XCircle className="not-found-icon" />
              <CardTitle>Chưa tìm thấy thư mục game</CardTitle>
            </div>
            <CardDescription>
              {error || "Vui lòng chọn thư mục cài đặt game Princess Connect Re:Dive"}
            </CardDescription>
          </CardHeader>
          <CardContent className="not-found-content">
            <div className="action-buttons center">
              <Button size="lg" onClick={autoDetectGame}>
                <Search className="icon" />
                Tự động tìm kiếm
              </Button>
              
              <Button variant="outline" size="lg" onClick={selectGameDirectory}>
                <FolderOpen className="icon" />
                Chọn thư mục thủ công
              </Button>
            </div>

            <div className="help-section">
              <h4 className="help-title">Thư mục game thường nằm ở:</h4>
              <ul className="help-list">
                <li>C:\Program Files (x86)\Steam\steamapps\common\PrincessConnectReDive</li>
                <li>C:\Program Files\DMM GAMES\PrincessConnectReDive</li>
                <li>D:\Games\PrincessConnectReDive</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}