import { LayoutDashboard, Store, Settings } from "lucide-react";
import { useWizardStore } from "../../store/useWizardStore";
import DashboardTab from "./DashboardTab";
import AppStoreTab from "./AppStoreTab";
import SettingsTab from "./SettingsTab";

type Tab = "dashboard" | "appstore" | "settings";

const TABS: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "appstore", label: "App Store", Icon: Store },
  { id: "settings", label: "Settings", Icon: Settings },
];

export default function ManagementShell() {
  const { managementTab, setManagementTab } = useWizardStore();

  return (
    <div className="flex flex-col h-screen bg-ot-bg overflow-hidden">
      {/* Top nav bar */}
      <header className="flex items-center justify-between px-6 border-b border-ot-border bg-ot-surface h-14 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/src/assets/logo-mark.png" alt="OpenTang" style={{ height: "28px" }} />
          <span className="text-ot-orange-500 font-bold text-lg tracking-tight">OpenTang</span>
          <span className="text-ot-text-muted text-xs font-mono">v0.1.0</span>
        </div>

        {/* Tab nav */}
        <nav className="flex items-center gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setManagementTab(id)}
              className={[
                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                managementTab === id
                  ? "bg-ot-orange-500/15 text-ot-orange-400 border border-ot-orange-500/30"
                  : "text-ot-text-secondary hover:text-ot-text hover:bg-ot-elevated",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Spacer to balance logo */}
        <div className="w-32" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {managementTab === "dashboard" && <DashboardTab />}
        {managementTab === "appstore" && <AppStoreTab />}
        {managementTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
