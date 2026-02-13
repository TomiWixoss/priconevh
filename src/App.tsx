import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus, Settings, Bell } from "lucide-react";
import { MainScreen } from "./components/pages/MainScreen";
import { SettingsPage } from "./components/pages/Settings";
import { useGamePath } from "./hooks/useGamePath";
import { useTranslation } from "./hooks/useTranslation";
import { useAppUpdate } from "./hooks/useAppUpdate";
import type { AppUpdateInfo } from "./types";

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
    <div className="app-container">
      {/* Custom Title Bar */}
      <div data-tauri-drag-region className="title-bar">
        <div className="title-bar-left">
          <div className="title-bar-logo" />
          <span className="title-bar-title">Priconne VN Installer</span>
        </div>
        <div className="title-bar-right">
          {updateInfo && (
            <button 
              className="title-bar-button update"
              title="Có bản cập nhật mới"
            >
              <Bell style={{ width: 16, height: 16 }} />
            </button>
          )}
          <button
            onClick={() => setCurrentPage(currentPage === "main" ? "settings" : "main")}
            className="title-bar-button"
            title="Cài đặt"
          >
            <Settings style={{ width: 16, height: 16 }} />
          </button>
          <button 
            onClick={handleMinimize}
            className="title-bar-button"
          >
            <Minus style={{ width: 16, height: 16 }} />
          </button>
          <button 
            onClick={handleClose}
            className="title-bar-button close"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
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
