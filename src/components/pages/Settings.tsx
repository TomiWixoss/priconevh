import { useState, useEffect } from "react";
import { Github, Bell, Power, Globe, Loader2, Save } from "lucide-react";
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Đang tải cài đặt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Cài đặt</h1>
          <p className="text-gray-400">Tùy chỉnh hoạt động của ứng dụng</p>
        </div>

        <div className="space-y-6">
          {/* Auto Update Settings */}
          <div className="glass-effect rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
            <div className="p-6 border-b border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Tự động cập nhật</h3>
                  <p className="text-sm text-gray-400">Quản lý cập nhật bản việt hóa</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Tự động cập nhật việt hóa</p>
                  <p className="text-sm text-gray-400">Khi có bản mới, tự động tải và cài đặt</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config?.auto_update || false}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, auto_update: e.target.checked } : null)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Kiểm tra khi khởi động</p>
                  <p className="text-sm text-gray-400">Kiểm tra bản cập nhật mỗi khi mở ứng dụng</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config?.check_update_on_startup || false}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, check_update_on_startup: e.target.checked } : null)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Auto Start Settings */}
          <div className="glass-effect rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
            <div className="p-6 border-b border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Power className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Khởi động cùng Windows</h3>
                  <p className="text-sm text-gray-400">Tự động chạy khi máy tính khởi động</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Chạy khi khởi động</p>
                  <p className="text-sm text-gray-400">Ứng dụng sẽ chạy ngầm khi Windows khởi động</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config?.auto_start || false}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, auto_start: e.target.checked } : null)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* GitHub Repository */}
          <div className="glass-effect rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
            <div className="p-6 border-b border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Github className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Repository việt hóa</h3>
                  <p className="text-sm text-gray-400">Nguồn tải bản việt hóa</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                GitHub Repository
              </label>
              <input
                type="text"
                value={config?.github_repo || ""}
                onChange={(e) => setConfig(prev => prev ? { ...prev, github_repo: e.target.value } : null)}
                placeholder="username/repository"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
              <p className="mt-2 text-xs text-gray-500">Ví dụ: tomisakae/priconevh-translation</p>
            </div>
          </div>

          {/* Language Settings */}
          <div className="glass-effect rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden">
            <div className="p-6 border-b border-[hsl(var(--glass-border))]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Ngôn ngữ</h3>
                  <p className="text-sm text-gray-400">Chọn ngôn ngữ giao diện</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Ngôn ngữ giao diện
              </label>
              <select
                value={config?.language || "vi"}
                onChange={(e) => setConfig(prev => prev ? { ...prev, language: e.target.value } : null)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-14 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-900 disabled:text-gray-400 font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu cài đặt
              </>
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl ${
            message.type === "success" 
              ? "bg-green-500/20 border border-green-500/30 text-green-400" 
              : "bg-red-500/20 border border-red-500/30 text-red-400"
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
