import { useState, useEffect } from "react";
import { Loader2, X, ChevronDown, Settings as SettingsIcon } from "lucide-react";
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
      <div className="settings-dialog glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title-area">
            <SettingsIcon size={24} className="settings-icon" />
            <div>
              <h2 className="settings-title">Cài đặt</h2>
              <p className="settings-subtitle">Tùy chỉnh trình khởi chạy</p>
            </div>
          </div>
          <button onClick={onClose} className="settings-close">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {isLoading ? (
            <div className="settings-loading">
              <Loader2 className="loading-spinner" size={32} />
              <p>Đang tải...</p>
            </div>
          ) : (
            <div className="settings-sections">
              {/* Section 1 */}
              <div className="settings-section">
                <h3 className="section-title">Cập nhật</h3>
                <div className="section-content">
                  <div className="setting-item">
                    <div className="setting-info">
                      <p className="setting-title">Tự động cập nhật</p>
                      <p className="setting-description">Tự động tải bản dịch mới khi có</p>
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
                      <p className="setting-description">Kiểm tra cập nhật mỗi khi mở app</p>
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
                      <p className="setting-description">Tự động chạy cùng Windows</p>
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

              {/* Section 3 */}
              <div className="settings-section">
                <h3 className="section-title">Hành vi</h3>
                <div className="section-content">
                  <div className="radio-group">
                    <label className="radio-item">
                      <input type="radio" name="close-behavior" value="minimize" defaultChecked />
                      <span className="radio-custom" />
                      <span className="radio-label">Thu nhỏ về khay</span>
                    </label>
                    <label className="radio-item">
                      <input type="radio" name="close-behavior" value="close" />
                      <span className="radio-custom" />
                      <span className="radio-label">Thoát hoàn toàn</span>
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
              <button onClick={onClose} className="btn-secondary" disabled={isSaving}>
                Hủy
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                {isSaving ? (
                  <>
                    <Loader2 className="btn-icon" size={16} />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}