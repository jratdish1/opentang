import { useState, useEffect } from "react";
import { LayoutDashboard, Store, Settings, X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useWizardStore } from "../../store/useWizardStore";
import DashboardTab from "./DashboardTab";
import AppStoreTab from "./AppStoreTab";
import SettingsTab from "./SettingsTab";

type Tab = "dashboard" | "appstore" | "settings";

interface UpdateInfo {
  version: string;
  body: string | null;
  date: string | null;
}

const TABS: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "appstore", label: "App Store", Icon: Store },
  { id: "settings", label: "Settings", Icon: Settings },
];

export default function ManagementShell() {
  const { managementTab, setManagementTab } = useWizardStore();
  const [availableUpdate, setAvailableUpdate] = useState<UpdateInfo | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    invoke<UpdateInfo | null>("check_for_update")
      .then((update) => {
        if (update) setAvailableUpdate(update);
      })
      .catch(() => {
        // silently ignore — no network or no update endpoint yet
      });
  }, []);

  const showBanner = availableUpdate && !bannerDismissed;

  return (
    <div className="flex flex-col h-screen bg-ot-bg overflow-hidden">
      {/* Update banner */}
      {showBanner && (
        <div className="flex items-center justify-between px-6 py-2 bg-ot-orange-500/10 border-b border-ot-orange-500/30 flex-shrink-0">
          <span className="text-sm text-ot-orange-400">
            🔔 OpenTang v{availableUpdate.version} is available
          </span>
          <div className="flex items-center gap-3">
            {availableUpdate.body && (
              <button
                onClick={() =>
                  openUrl("https://github.com/Koba42Corp/opentang/releases/latest")
                }
                className="text-xs text-ot-orange-400 underline underline-offset-2 hover:text-ot-orange-300"
              >
                What's new
              </button>
            )}
            <button
              onClick={() =>
                openUrl("https://github.com/Koba42Corp/opentang/releases/latest")
              }
              className="text-xs bg-ot-orange-500 text-white px-3 py-1 rounded hover:bg-ot-orange-400 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-ot-text-muted hover:text-ot-text transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top nav bar */}
      <header className="flex items-center justify-between px-6 border-b border-ot-border bg-ot-surface h-14 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
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
