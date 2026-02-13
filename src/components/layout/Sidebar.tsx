import { Crown } from "lucide-react";

interface SidebarProps {
  items: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  currentPage: string;
  onNavigate: (page: "dashboard" | "game-path" | "translation" | "settings") => void;
}

export function Sidebar({ items, currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Crown className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">Priconne VN</span>
      </div>
      
      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.id as "dashboard" | "game-path" | "translation" | "settings")}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <div className="version-badge">v1.0.0</div>
      </div>
    </aside>
  );
}