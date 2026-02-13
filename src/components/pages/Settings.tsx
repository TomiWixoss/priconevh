import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Github, Bell, Power, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { configApi } from "@/lib/api";
import type { AppConfig } from "@/types";

export function SettingsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const cfg = await configApi.load();
      setConfig(cfg);
    } catch (err) {
      setMessage({ type: "error", text: "Không thể tải cài đặt" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    setMessage(null);
    
    try {
      await configApi.save(config);
      setMessage({ type: "success", text: "Đã lưu cài đặt" });
    } catch (err) {
      setMessage({ type: "error", text: "Không thể lưu cài đặt" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoUpdateChange = (value: boolean) => {
    setConfig(prev => prev ? { ...prev, auto_update: value } : null);
  };

  const handleAutoStartChange = (value: boolean) => {
    setConfig(prev => prev ? { ...prev, auto_start: value } : null);
  };

  const handleCheckUpdateChange = (value: boolean) => {
    setConfig(prev => prev ? { ...prev, check_update_on_startup: value } : null);
  };

  const handleGithubRepoChange = (value: string) => {
    setConfig(prev => prev ? { ...prev, github_repo: value } : null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="loading-state">
          <Loader2 className="loading-icon" />
          <p>Đang tải cài đặt...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-description">
          Tùy chỉnh hoạt động của ứng dụng
        </p>
      </div>

      <div className="settings-grid">
        {/* Auto Update */}
        <Card className="settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="icon" />
              Tự động cập nhật
            </CardTitle>
            <CardDescription>
              Tự động kiểm tra và cài đặt bản việt hóa mới
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="setting-row">
              <div className="setting-info">
                <Label>Tự động cập nhật việt hóa</Label>
                <p className="setting-description">
                  Khi có bản việt hóa mới, tự động tải và cài đặt
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={config?.auto_update || false}
                onChange={(e) => handleAutoUpdateChange(e.target.checked)}
              />
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <Label>Kiểm tra khi khởi động</Label>
                <p className="setting-description">
                  Kiểm tra bản cập nhật mỗi khi mở ứng dụng
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={config?.check_update_on_startup || false}
                onChange={(e) => handleCheckUpdateChange(e.target.checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Auto Start */}
        <Card className="settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="icon" />
              Khởi động cùng Windows
            </CardTitle>
            <CardDescription>
              Tự động chạy ứng dụng khi máy tính khởi động
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="setting-row">
              <div className="setting-info">
                <Label>Chạy khi khởi động</Label>
                <p className="setting-description">
                  Ứng dụng sẽ chạy ngầm khi Windows khởi động
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={config?.auto_start || false}
                onChange={(e) => handleAutoStartChange(e.target.checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* GitHub Repository */}
        <Card className="settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="icon" />
              Repository việt hóa
            </CardTitle>
            <CardDescription>
              Đường dẫn GitHub chứa bản việt hóa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="setting-row">
              <Label htmlFor="github-repo">Repository</Label>
              <Input
                id="github-repo"
                value={config?.github_repo || ""}
                onChange={(e) => handleGithubRepoChange(e.target.value)}
                placeholder="username/repository"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="icon" />
              Ngôn ngữ
            </CardTitle>
            <CardDescription>
              Chọn ngôn ngữ giao diện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="setting-row">
              <Label>Ngôn ngữ giao diện</Label>
              <select
                className="select"
                value={config?.language || "vi"}
                onChange={(e) => setConfig(prev => prev ? { ...prev, language: e.target.value } : null)}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save button */}
      <div className="settings-footer">
        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="icon animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <SettingsIcon className="icon" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}