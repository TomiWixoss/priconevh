import { useState, useEffect } from "react";
import { Bell, Power, Globe, Loader2, Save, X } from "lucide-react";
import { configApi } from "../../lib/api";
import type { AppConfig } from "../../types";
import "./Settings.css";

interface SettingsDialogProps {
  onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
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
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setMessage({ type: "error", text: "Không thể lưu cài đặt" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <div>
            <h2 className="settings-title">Cài đặt</h2>
            <p className="settings-subtitle">Cài đặt trình khởi chạy</p>
          </div>
          <button onClick={onClose} className="settings-close">
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {isLoading ? (
            <div className="settings-loading">
              <Loader2 className="loading-spinner" />
              <p>Đang tải cài đặt...</p>
            </div>
          ) : (
            <div className="settings-sections">
              {/* Section 1 */}
              <div className="settings-section">
                <div className="section-header">
                  <Bell className="section-icon" />
                  <h3 className="section-title">Cài đặt trình khởi chạy</h3>
                </div>
                <div className="section-content">
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-title">Tự động cập nhật việt hóa</p>
                      <p className="setting-description">Khi có bản mới, tự động tải và cài đặt</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={config?.auto_update || false}
                        onChange={(e) => setConfig(prev => prev ? { ...prev, auto_update: e.target.checked } : null)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-title">Kiểm tra khi khởi động</p>
                      <p className="setting-description">Kiểm tra bản cập nhật mỗi khi mở ứng dụng</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={config?.check_update_on_startup || false}
                        onChange={(e) => setConfig(prev => prev ? { ...prev, check_update_on_startup: e.target.checked } : null)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-title">Chạy khi khởi động</p>
                      <p className="setting-description">Ứng dụng sẽ chạy ngầm khi Windows khởi động</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={config?.auto_start || false}
                        onChange={(e) => setConfig(prev => prev ? { ...prev, auto_start: e.target.checked } : null)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="settings-section">
                <div className="section-header">
                  <Globe className="section-icon" />
                  <h3 className="section-title">Ngôn ngữ trình khởi chạy</h3>
                </div>
                <div className="section-content">
                  <label className="input-label">Ngôn ngữ giao diện</label>
                  <select
                    value={config?.language || "vi"}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, language: e.target.value } : null)}
                    className="select-input"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>

              {/* Section 3 */}
              <div className="settings-section">
                <div className="section-header">
                  <Power className="section-icon" />
                  <h3 className="section-title">Cài đặt khởi chạy</h3>
                </div>
                <div className="section-content">
                  <label className="input-label">GitHub Repository</label>
                  <input
                    type="text"
                    value={config?.github_repo || ""}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, github_repo: e.target.value } : null)}
                    placeholder="username/repository"
                    className="text-input"
                  />
                  <p className="input-hint">Ví dụ: tomisakae/priconevh-translation</p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="settings-section">
                <div className="section-header">
                  <X className="section-icon" />
                  <h3 className="section-title">Khi đóng cửa sổ</h3>
                </div>
                <div className="section-content">
                  <div className="radio-group">
                    <label className="radio-item">
                      <input type="radio" name="close-behavior" value="minimize" defaultChecked />
                      <span className="radio-label">Thu nhỏ về khay hệ thống</span>
                    </label>
                    <label className="radio-item">
                      <input type="radio" name="close-behavior" value="close" />
                      <span className="radio-label">Thoát trình khởi chạy</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="settings-footer">
            {message && (
              <div className={`settings-message ${message.type}`}>
                {message.text}
              </div>
            )}
            <div className="settings-actions">
              <button onClick={onClose} className="button-secondary" disabled={isSaving}>
                Hủy
              </button>
              <button onClick={handleSave} disabled={isSaving} className="button-primary">
                {isSaving ? (
                  <>
                    <Loader2 />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
