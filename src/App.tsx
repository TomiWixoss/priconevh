import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus } from "lucide-react";
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
      {/* Custom Title Bar - Minimal */}
      <div data-tauri-drag-region className="title-bar">
        <div className="title-bar-left">
          <div className="title-bar-logo" />
          <span className="title-bar-title">Priconne VN</span>
        </div>
        <div className="title-bar-right">
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
        <MainScreen
          gamePathHook={gamePathHook}
          translationHook={translationHook}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      {/* Settings Dialog */}
      {showSettings && (
        <SettingsDialog onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
