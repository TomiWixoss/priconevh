import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { MainScreen } from "./components/pages/MainScreen";
import { SettingsDialog } from "./components/pages/Settings";
import { useGamePath } from "./hooks/useGamePath";
import { useTranslation } from "./hooks/useTranslation";
import { useAppUpdate } from "./hooks/useAppUpdate";
import { initFirebase } from "./lib/firebase";
import "./App.css";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  
  const gamePathHook = useGamePath();
  const translationHook = useTranslation();
  const appUpdateHook = useAppUpdate();

  // Initialize Firebase on app start
  useEffect(() => {
    initFirebase();
  }, []);

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
    </div>
  );
}

export default App;
