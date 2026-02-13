import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppUpdateInfo } from "@/types";

interface UpdateNotificationProps {
  info: AppUpdateInfo;
  onUpdate: () => void;
  isDownloading: boolean;
  progress: number;
}

export function UpdateNotification({ info, onUpdate, isDownloading, progress }: UpdateNotificationProps) {
  if (isDownloading) {
    return (
      <Card className="update-downloading">
        <CardContent className="update-content">
          <div className="update-info">
            <span className="update-label">Đang tải bản cập nhật...</span>
            <span className="update-progress">{Math.round(progress)}%</span>
          </div>
          <div className="update-progress-bar">
            <div className="update-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="update-notification">
      <CardContent className="update-content">
        <div className="update-info">
          <span className="update-version">v{info.version}</span>
          <span className="update-label">có sẵn</span>
        </div>
        <div className="update-actions">
          <Button size="sm" onClick={onUpdate}>
            <Download className="icon-sm" />
            Cập nhật
          </Button>
          <a
            href={`https://github.com/${info.body?.split('\n')[0] || ''}/releases/tag/v${info.version}`}
            target="_blank"
            rel="noopener noreferrer"
            className="update-link"
          >
            <ExternalLink className="icon-sm" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}