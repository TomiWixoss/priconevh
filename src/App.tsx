import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Home, Settings as SettingsIcon, Download, Gamepad2, X, Minus, Bell } from "lucide-react";
import { Dashboard } from "@/components/pages/Dashboard";
import { GamePath } from "@/components/pages/GamePath";
import { Translation } from "@/components/pages/Translation";
import { SettingsPage } from "@/components/pages/Settings";
import { useGamePath } from "@/hooks/useGamePath";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import type { AppUpdateInfo } from "@/types";

type Page = "dashboard" | "game-path" | "translation" | "settings";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
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

  const navItems: NavItem[] = [
    { id: "dashboard", label: "Trang chủ", icon: Home },
    { id: "translation", label: "Việt hóa", icon: Download },
    { id: "game-path", label: "Thư mục", icon: Gamepad2 },
    { id: "settings", label: "Cài đặt", icon: SettingsIcon },
  ];

  const handleMinimize = async () => {
    const window = getCurrentWindow();
    await window.minimize();
  };

  const handleClose = async () => {
    const window = getCurrentWindow();
    await window.close();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Custom Title Bar */}
      <div 
        data-tauri-drag-region 
        className="fixed top-0 left-0 right-0 h-8 bg-[hsl(var(--sidebar-bg))]/95 backdrop-blur-sm z-50 flex items-center justify-between px-4 border-b border-[hsl(var(--card-border))]"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400 to-orange-500" />
          <span className="text-xs font-medium text-gray-300">Priconne VN Installer</span>
        </div>
        <div className="flex items-center gap-1">
          {updateInfo && (
            <button className="w-8 h-8 flex items-center justify-center text-yellow-400 hover:bg-white/10 rounded transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white rounded transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-20 bg-[hsl(var(--sidebar-bg))] flex flex-col items-center pt-12 pb-6 gap-2 border-r border-[hsl(var(--card-border))]">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
          <span className="text-2xl font-bold text-gray-900">P</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-1 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`
                  w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-[hsl(var(--sidebar-active))] text-yellow-400' 
                    : 'text-gray-400 hover:bg-[hsl(var(--sidebar-hover))] hover:text-white'
                  }
                `}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-10 bg-yellow-400 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden mt-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;