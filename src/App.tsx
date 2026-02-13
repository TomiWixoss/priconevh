import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { Home } from "lucide-react";
import { Settings } from "lucide-react";
import { Download } from "lucide-react";
import { Gamepad2 } from "lucide-react";
import { Crown } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Dashboard } from "@/components/pages/Dashboard";
import { GamePath } from "@/components/pages/GamePath";
import { Translation } from "@/components/pages/Translation";
import { SettingsPage } from "@/components/pages/Settings";
import { UpdateNotification } from "@/components/ui/UpdateNotification";
import { useGamePath } from "@/hooks/useGamePath";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import type { AppUpdateInfo } from "@/types";

type Page = "dashboard" | "game-path" | "translation" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  
  const gamePathHook = useGamePath();
  const translationHook = useTranslation();
  const appUpdateHook = useAppUpdate();

  // Check for app updates on mount
  useEffect(() => {
    appUpdateHook.checkForUpdates().then(setUpdateInfo);
  }, []);

  // Listen for translation progress events
  useEffect(() => {
    const unlisten = listen<[string, number]>("translation-progress", (event) => {
      const [message, progress] = event.payload;
      translationHook.setProgress({ message, progress });
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            gamePathHook={gamePathHook}
            translationHook={translationHook}
            onNavigate={(page) => setCurrentPage(page as Page)}
          />
        );
      case "game-path":
        return <GamePath hook={gamePathHook} />;
      case "translation":
        return <Translation hook={translationHook} gamePath={gamePathHook.gamePath} />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: "dashboard" as Page, label: "Tổng quan", icon: Home },
    { id: "game-path" as Page, label: "Thư mục game", icon: Gamepad2 },
    { id: "translation" as Page, label: "Việt hóa", icon: Download },
    { id: "settings" as Page, label: "Cài đặt", icon: Settings },
  ];

  return (
    <div className="app-layout">
      <Sidebar
        items={navItems}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="main-content">
        <header className="app-header">
          <div className="header-left">
            <Crown className="header-icon" />
            <h1 className="app-title">Priconne VN Installer</h1>
          </div>
          <div className="header-right">
            {updateInfo && (
              <UpdateNotification
                info={updateInfo}
                onUpdate={appUpdateHook.downloadAndInstall}
                isDownloading={appUpdateHook.isDownloading}
                progress={appUpdateHook.progress}
              />
            )}
          </div>
        </header>
        
        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;