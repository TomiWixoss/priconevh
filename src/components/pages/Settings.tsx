import { useState, useEffect } from "react";
import { Github, Bell, Power, Globe, Loader2, Save, ArrowLeft } from "lucide-react";
import { configApi } from "../../lib/api";
import type { AppConfig } from "../../types";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
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
      setMessage({ type: "success", text: "Đã lưu cài đặt thành công" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: "Không thể lưu cài đặt" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 className="loading-spinner" />
          <p className="loading-text">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header with Back Button */}
        <div className="settings-header">
          <button
            onClick={onBack}
            className="back-button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="settings-title">Cài đặt</h1>
            <p className="settings-subtitle">Tùy chỉnh hoạt động của ứng dụng</p>
          </div>
        </div>

        <div className="settings-sections">
          {/* Auto Update Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon yellow">
                <Bell style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="settings-section-title">Tự động cập nhật</h3>
                <p className="settings-section-description">Quản lý cập nhật bản việt hóa</p>
              </div>
            </div>
            <div className="settings-section-content">
              <div className="settings-item">
                <div className="settings-item-info">
                  <p className="settings-item-title">Tự động cập nhật việt hóa</p>
                  <p className="settings-item-description">Khi có bản mới, tự động tải và cài đặt</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config?.auto_update || false}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, auto_update: e.target.checked } : null)}
                  />
                  <div className="toggle-slider"></div>
                </label>
              </div>

              <div className="settings-item">
                <div className="settings-item-info">
                  <p className="settings-item-title">Kiểm tra khi khởi động</p>
                  <p className="settings-item-description">Kiểm tra bản cập nhật mỗi khi mở ứng dụng</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config?.check_update_on_startup || false}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, check_update_on_startup: e.target.checked } : null)}
                  />
                  <div className="toggle-slider"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Auto Start Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon blue">
                <Power style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="settings-section-title">Khởi động cùng Windows</h3>
                <p className="settings-section-description">Tự động chạy khi máy tính khởi động</p>
              </div>
            </div>
            <div className="settings-section-content">
              <div className="settings-item">
                <div className="settings-item-info">
                  <p className="settings-item-title">Chạy khi khởi động</p>
                  <p className="settings-item-description">Ứng dụng sẽ chạy ngầm khi Windows khởi động</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config?.auto_start || false}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, auto_start: e.target.checked } : null)}
                  />
                  <div className="toggle-slider"></div>
                </label>
              </div>
            </div>
          </div>

          {/* GitHub Repository */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon purple">
                <Github style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="settings-section-title">Repository việt hóa</h3>
                <p className="settings-section-description">Nguồn tải bản việt hóa</p>
              </div>
            </div>
            <div className="settings-section-content">
              <label className="input-label">
                GitHub Repository
              </label>
              <input
                type="text"
                value={config?.github_repo || ""}
                onChange={(e) => setConfig(prev => prev ? { ...prev, github_repo: e.target.value } : null)}
                placeholder="username/repository"
                className="input-field"
              />
              <p className="input-hint">Ví dụ: tomisakae/priconevh-translation</p>
            </div>
          </div>

          {/* Language Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon green">
                <Globe style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="settings-section-title">Ngôn ngữ</h3>
                <p className="settings-section-description">Chọn ngôn ngữ giao diện</p>
              </div>
            </div>
            <div className="settings-section-content">
              <label className="input-label">
                Ngôn ngữ giao diện
              </label>
              <select
                value={config?.language || "vi"}
                onChange={(e) => setConfig(prev => prev ? { ...prev, language: e.target.value } : null)}
                className="select-field"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="save-button-container">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="save-button"
          >
            {isSaving ? (
              <>
                <Loader2 style={{ width: 20, height: 20 }} />
                Đang lưu...
              </>
            ) : (
              <>
                <Save style={{ width: 20, height: 20 }} />
                Lưu cài đặt
              </>
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`message ${message.type}`}>
            <p className="message-text">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
