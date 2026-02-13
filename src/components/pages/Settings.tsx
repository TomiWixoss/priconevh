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
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        {/* Dialog Header */}
        <div className="dialog-header">
          <div>
            <h2 className="dialog-title">Cài đặt</h2>
            <p className="dialog-subtitle">Cài đặt trình khởi chạy</p>
          </div>
          <button onClick={onClose} className="dialog-close-button">
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Dialog Content */}
        <div className="dialog-content">
          {isLoading ? (
            <div className="dialog-loading">
              <Loader2 className="loading-spinner" style={{ width: 32, height: 32 }} />
              <p>Đang tải cài đặt...</p>
            </div>
          ) : (
            <div className="dialog-sections">
              {/* Cài đặt trình khởi chạy */}
              <div className="dialog-section">
                <div className="dialog-section-header">
                  <div className="dialog-section-icon yellow">
                    <Bell style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 className="dialog-section-title">Cài đặt trình khởi chạy</h3>
                  </div>
                </div>
                <div className="dialog-section-content">
                  <div className="dialog-item">
                    <div className="dialog-item-info">
                      <p className="dialog-item-title">Tự động cập nhật việt hóa</p>
                      <p className="dialog-item-description">Khi có bản mới, tự động tải và cài đặt</p>
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

                  <div className="dialog-item">
                    <div className="dialog-item-info">
                      <p className="dialog-item-title">Kiểm tra khi khởi động</p>
                      <p className="dialog-item-description">Kiểm tra bản cập nhật mỗi khi mở ứng dụng</p>
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

                  <div className="dialog-item">
                    <div className="dialog-item-info">
                      <p className="dialog-item-title">Chạy khi khởi động</p>
                      <p className="dialog-item-description">Ứng dụng sẽ chạy ngầm khi Windows khởi động</p>
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

              {/* Ngôn ngữ trình khởi chạy */}
              <div className="dialog-section">
                <div className="dialog-section-header">
                  <div className="dialog-section-icon green">
                    <Globe style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 className="dialog-section-title">Ngôn ngữ trình khởi chạy</h3>
                  </div>
                </div>
                <div className="dialog-section-content">
                  <label className="dialog-label">Ngôn ngữ giao diện</label>
                  <select
                    value={config?.language || "vi"}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, language: e.target.value } : null)}
                    className="dialog-select"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>

              {/* Cài đặt khởi chạy */}
              <div className="dialog-section">
                <div className="dialog-section-header">
                  <div className="dialog-section-icon blue">
                    <Power style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 className="dialog-section-title">Cài đặt khởi chạy</h3>
                  </div>
                </div>
                <div className="dialog-section-content">
                  <label className="dialog-label">GitHub Repository</label>
                  <input
                    type="text"
                    value={config?.github_repo || ""}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, github_repo: e.target.value } : null)}
                    placeholder="username/repository"
                    className="dialog-input"
                  />
                  <p className="dialog-hint">Ví dụ: tomisakae/priconevh-translation</p>
                </div>
              </div>

              {/* Khi đóng cửa sổ */}
              <div className="dialog-section">
                <div className="dialog-section-header">
                  <div className="dialog-section-icon purple">
                    <X style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <h3 className="dialog-section-title">Khi đóng cửa sổ</h3>
                  </div>
                </div>
                <div className="dialog-section-content">
                  <div className="dialog-radio-group">
                    <label className="dialog-radio-item">
                      <input
                        type="radio"
                        name="close-behavior"
                        value="minimize"
                        defaultChecked
                      />
                      <div className="dialog-radio-content">
                        <p className="dialog-radio-title">Thu nhỏ về khay hệ thống</p>
                      </div>
                    </label>
                    <label className="dialog-radio-item">
                      <input
                        type="radio"
                        name="close-behavior"
                        value="close"
                      />
                      <div className="dialog-radio-content">
                        <p className="dialog-radio-title">Thoát trình khởi chạy</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        {!isLoading && (
          <div className="dialog-footer">
            {message && (
              <div className={`dialog-message ${message.type}`}>
                <p>{message.text}</p>
              </div>
            )}
            <div className="dialog-actions">
              <button
                onClick={onClose}
                className="dialog-button-secondary"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="dialog-button-primary"
              >
                {isSaving ? (
                  <>
                    <Loader2 style={{ width: 18, height: 18 }} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save style={{ width: 18, height: 18 }} />
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
