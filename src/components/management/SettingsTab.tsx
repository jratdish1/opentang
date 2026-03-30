import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  FolderOpen,
  FileText,
  RefreshCcw,
  Info,
  CheckCircle,
  Loader,
} from "lucide-react";
import { useWizardStore } from "../../store/useWizardStore";

const APP_VERSION = "0.1.0";

export default function SettingsTab() {
  const { installState, installPath } = useWizardStore();
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const path = installState?.installPath ?? installPath;
  const logPath = `${path}/opentang.log`;

  async function openInstallDir() {
    try {
      await openUrl(path);
    } catch {
      // Ignore — will fail in browser dev mode
    }
  }

  async function openLogs() {
    try {
      await openUrl(logPath);
    } catch {
      window.open(logPath, "_blank", "noreferrer");
    }
  }

  async function checkForUpdates() {
    setCheckingUpdates(true);
    setUpdateStatus(null);
    try {
      const resp = await fetch("https://registry.opentang.koba42.com/version.json");
      const data = await resp.json();
      const latest: string = data.latest ?? APP_VERSION;
      const parseV = (v: string) => v.replace(/[^0-9.]/g, "").split(".").map(Number);
      const lv = parseV(latest);
      const cv = parseV(APP_VERSION);
      let newer = false;
      for (let i = 0; i < Math.max(lv.length, cv.length); i++) {
        if ((lv[i] ?? 0) > (cv[i] ?? 0)) { newer = true; break; }
        if ((lv[i] ?? 0) < (cv[i] ?? 0)) break;
      }
      setUpdateStatus(newer ? `v${latest} available` : "You're up to date!");
    } catch {
      setUpdateStatus("Could not reach update server.");
    } finally {
      setCheckingUpdates(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-ot-text mb-5">Settings</h2>

      {/* Install path */}
      <section className="rounded-xl border border-ot-border bg-ot-elevated mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-ot-border">
          <span className="text-xs font-semibold text-ot-text-secondary uppercase tracking-wider">
            Installation
          </span>
        </div>
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ot-text-secondary mb-0.5">Install directory</p>
            <p className="text-sm text-ot-text font-mono">{path}</p>
          </div>
          <button
            onClick={openInstallDir}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-overlay text-xs text-ot-text hover:bg-ot-elevated transition-colors flex-shrink-0"
          >
            <FolderOpen className="w-3.5 h-3.5 text-ot-orange-400" />
            Open directory
          </button>
        </div>

        {installState && (
          <>
            <div className="px-4 py-3 border-t border-ot-border flex items-center justify-between">
              <p className="text-sm text-ot-text-secondary">Edition</p>
              <p className="text-sm text-ot-text capitalize font-medium">{installState.edition}</p>
            </div>
            <div className="px-4 py-3 border-t border-ot-border flex items-center justify-between">
              <p className="text-sm text-ot-text-secondary">Network mode</p>
              <p className="text-sm text-ot-text capitalize font-medium">{installState.networkMode}</p>
            </div>
            {installState.domain && (
              <div className="px-4 py-3 border-t border-ot-border flex items-center justify-between">
                <p className="text-sm text-ot-text-secondary">Domain</p>
                <p className="text-sm text-ot-text font-mono">{installState.domain}</p>
              </div>
            )}
            <div className="px-4 py-3 border-t border-ot-border flex items-center justify-between">
              <p className="text-sm text-ot-text-secondary">Installed</p>
              <p className="text-sm text-ot-text-muted">
                {new Date(installState.installedAt).toLocaleDateString()}
              </p>
            </div>
          </>
        )}
      </section>

      {/* App info */}
      <section className="rounded-xl border border-ot-border bg-ot-elevated mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-ot-border">
          <span className="text-xs font-semibold text-ot-text-secondary uppercase tracking-wider">
            About
          </span>
        </div>
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-ot-orange-400" />
            <p className="text-sm text-ot-text">OpenTang</p>
          </div>
          <p className="text-sm text-ot-text-muted font-mono">v{APP_VERSION}</p>
        </div>

        <div className="px-4 py-3 border-t border-ot-border flex items-center justify-between">
          <p className="text-sm text-ot-text-secondary">Check for updates</p>
          <div className="flex items-center gap-3">
            {updateStatus && (
              <span className="flex items-center gap-1 text-xs text-ot-text-secondary">
                <CheckCircle className="w-3 h-3 text-ot-success" />
                {updateStatus}
              </span>
            )}
            <button
              onClick={checkForUpdates}
              disabled={checkingUpdates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-overlay text-xs text-ot-text hover:bg-ot-elevated transition-colors disabled:opacity-50"
            >
              {checkingUpdates ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCcw className="w-3.5 h-3.5 text-ot-info" />
              )}
              Check now
            </button>
          </div>
        </div>
      </section>

      {/* Logs */}
      <section className="rounded-xl border border-ot-border bg-ot-elevated overflow-hidden">
        <div className="px-4 py-3 border-b border-ot-border">
          <span className="text-xs font-semibold text-ot-text-secondary uppercase tracking-wider">
            Diagnostics
          </span>
        </div>
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-ot-text">View logs</p>
            <p className="text-xs text-ot-text-muted font-mono mt-0.5">{logPath}</p>
          </div>
          <button
            onClick={openLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-overlay text-xs text-ot-text hover:bg-ot-elevated transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-ot-orange-400" />
            Open log file
          </button>
        </div>
      </section>

      {/* Footer */}
      <p className="text-xs text-ot-text-muted mt-6 text-center">
        Powered by{" "}
        <span className="text-ot-orange-400 font-semibold">Koba42</span>
      </p>
    </div>
  );
}
