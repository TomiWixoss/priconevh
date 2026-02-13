import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus, Settings, Bell } from "lucide-react";
import { MainScreen } from "@/components/pages/MainScreen";
import { SettingsPage } from "@/components/pages/Settings";
import { useGamePath } from "@/hooks/useGamePath";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import type { AppUpdateInfo } from "@/types";

type Page = "main" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("main");
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  
  const gamePathHook = useGamePath();
  const translationHook = useTranslation();
  const appUpdateHook = useAppUpdate();

  useEffect(() => {
    appUpdateHook.checkForUpdates().then(setUpdateInfo);
  }, []);

  useEffect(() => {
    const unlisten = listen<[string, number]>("translation-progress", (event) => {
      const [message, progress] = event.payload;
      translationHook.setProgress({ message, progress });
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleMinimize = async () => {
    const window = getCurrentWindow();
    await window.minimize();
  };

  const handleClose = async () => {
    const window = getCurrentWindow();
    await window.close();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Custom Title Bar */}
      <div 
        data-tauri-drag-region 
        className="h-10 bg-[hsl(var(--sidebar-bg))]/95 backdrop-blur-sm flex items-center justify-between px-4 border-b border-[hsl(var(--card-border))] flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-yellow-400 to-orange-500" />
          <span className="text-sm font-semibold text-white">Priconne VN Installer</span>
        </div>
        <div className="flex items-center gap-1">
          {updateInfo && (
            <button 
              className="w-9 h-9 flex items-center justify-center text-yellow-400 hover:bg-white/10 rounded transition-colors"
              title="Có bản cập nhật mới"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setCurrentPage(currentPage === "main" ? "settings" : "main")}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded transition-colors"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={handleMinimize}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentPage === "main" ? (
          <MainScreen
            gamePathHook={gamePathHook}
            translationHook={translationHook}
          />
        ) : (
          <SettingsPage onBack={() => setCurrentPage("main")} />
        )}
      </div>
    </div>
  );
}

export default App;
