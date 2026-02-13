import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { MainScreen } from "./components/pages/MainScreen";
import { SettingsDialog } from "./components/pages/Settings";
import { useGamePath } from "./hooks/useGamePath";
import { useTranslation } from "./hooks/useTranslation";
import { useAppUpdate } from "./hooks/useAppUpdate";
import "./App.css";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  
  const gamePathHook = useGamePath();
  const translationHook = useTranslation();
  const appUpdateHook = useAppUpdate();

  useEffect(() => {
    appUpdateHook.checkForUpdates();
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

  return (
    <div className="app-container">
      <MainScreen
        gamePathHook={gamePathHook}
        translationHook={translationHook}
        onOpenSettings={() => setShowSettings(true)}
      />

      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}

      {/* Update Dialog */}
      {appUpdateHook.updateInfo && (
        <div className="confirm-overlay">
          <div className="update-dialog glass-panel">
            <h3 className="update-title">Có bản cập nhật mới!</h3>
            <div className="update-info">
              <p className="update-version">
                Phiên bản mới: <strong>{appUpdateHook.updateInfo.version}</strong>
              </p>
              <p className="update-current">
                Phiên bản hiện tại: {appUpdateHook.updateInfo.current_version}
              </p>
            </div>
            
            {appUpdateHook.isDownloading ? (
              <div className="update-progress">
                <p>Đang tải xuống... {Math.round(appUpdateHook.progress)}%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${appUpdateHook.progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="update-actions">
                <button 
                  onClick={appUpdateHook.dismissUpdate}
                  className="update-btn update-cancel"
                >
                  Để sau
                </button>
                <button 
                  onClick={appUpdateHook.downloadAndInstall}
                  className="update-btn update-confirm"
                >
                  Cập nhật ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
