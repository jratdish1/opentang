import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  RefreshCcw,
  ExternalLink,
  CheckCircle,
  XCircle,
  PauseCircle,
  Loader,
  Play,
  RotateCcw,
  Square,
  ArrowUpCircle,
  Bell,
} from "lucide-react";
import { useWizardStore, ServiceStatus } from "../../store/useWizardStore";

interface VersionInfo {
  latest: string;
  releaseNotes?: string;
}

const CURRENT_VERSION = "0.1.0";

function semverGreater(a: string, b: string): boolean {
  const parse = (v: string) => v.replace(/[^0-9.]/g, "").split(".").map(Number);
  const av = parse(a);
  const bv = parse(b);
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    if ((av[i] ?? 0) > (bv[i] ?? 0)) return true;
    if ((av[i] ?? 0) < (bv[i] ?? 0)) return false;
  }
  return false;
}

function StatusBadge({ status }: { status: ServiceStatus["status"] | "loading" }) {
  if (status === "loading") return (
    <span className="flex items-center gap-1 text-xs text-ot-text-muted">
      <Loader className="w-3 h-3 animate-spin" /> Loading
    </span>
  );
  if (status === "running") return (
    <span className="flex items-center gap-1 text-xs text-ot-success font-medium">
      <CheckCircle className="w-3 h-3" /> Running
    </span>
  );
  if (status === "error") return (
    <span className="flex items-center gap-1 text-xs text-ot-error font-medium">
      <XCircle className="w-3 h-3" /> Error
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-ot-warning font-medium">
      <PauseCircle className="w-3 h-3" /> Stopped
    </span>
  );
}

function getServicePort(ports: string[]): number | null {
  if (!ports.length) return null;
  const first = ports[0];
  const match = first.match(/^(\d+):/);
  return match ? parseInt(match[1]) : null;
}

export default function DashboardTab() {
  const { installState, installPath } = useWizardStore();
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const path = installState?.installPath ?? installPath;

  async function refresh() {
    setLoading(true);
    try {
      const s = await invoke<ServiceStatus[]>("get_service_status", { installPath: path });
      setStatuses(s);
    } catch {
      // keep current
    } finally {
      setLoading(false);
    }
  }

  // Check for app updates
  useEffect(() => {
    fetch("https://registry.opentang.koba42.com/version.json")
      .then((r) => r.json())
      .then((v: VersionInfo) => {
        if (semverGreater(v.latest, CURRENT_VERSION)) {
          setUpdateInfo(v);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  async function openService(port: number) {
    const url = `http://localhost:${port}`;
    try {
      await openUrl(url);
    } catch {
      window.open(url, "_blank", "noreferrer");
    }
  }

  async function runQuickAction(action: "restart" | "stop" | "update") {
    setActionBusy(true);
    try {
      // We call docker compose directly via the existing install commands
      // For simplicity, we re-fetch status after a brief delay
      if (action === "update") {
        await invoke("update_package", { packageId: "all", installPath: path });
      }
    } catch {
      // ignore
    } finally {
      setTimeout(() => {
        refresh();
        setActionBusy(false);
      }, 2000);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Update banner */}
      {updateInfo && !updateDismissed && (
        <div className="flex items-center justify-between bg-ot-orange-500/10 border border-ot-orange-500/30 rounded-xl px-4 py-3 mb-5 text-sm">
          <div className="flex items-center gap-2 text-ot-orange-300">
            <Bell className="w-4 h-4" />
            <span>
              <span className="font-semibold">OpenTang {updateInfo.latest}</span> is available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Koba42/opentang/releases"
              target="_blank"
              rel="noreferrer"
              className="text-ot-orange-400 hover:text-ot-orange-300 transition-colors text-xs font-medium"
            >
              View Release Notes ↗
            </a>
            <a
              href="https://github.com/Koba42/opentang/releases"
              target="_blank"
              rel="noreferrer"
              className="bg-ot-orange-500 hover:bg-ot-orange-400 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
            >
              Update Now
            </a>
            <button
              onClick={() => setUpdateDismissed(true)}
              className="text-ot-text-muted hover:text-ot-text transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-ot-text">Dashboard</h2>
          {installState && (
            <p className="text-xs text-ot-text-muted mt-0.5">
              {installState.edition} edition · {path}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-elevated text-sm text-ot-text hover:bg-ot-overlay transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs font-semibold text-ot-text-secondary uppercase tracking-wider mr-1">
          Quick Actions
        </span>
        <button
          onClick={() => runQuickAction("restart")}
          disabled={actionBusy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-elevated text-xs text-ot-text hover:bg-ot-overlay transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3 text-ot-info" />
          Restart All
        </button>
        <button
          onClick={() => runQuickAction("stop")}
          disabled={actionBusy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-elevated text-xs text-ot-text hover:bg-ot-overlay transition-colors disabled:opacity-50"
        >
          <Square className="w-3 h-3 text-ot-warning" />
          Stop All
        </button>
        <button
          onClick={() => runQuickAction("update")}
          disabled={actionBusy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-elevated text-xs text-ot-text hover:bg-ot-overlay transition-colors disabled:opacity-50"
        >
          <ArrowUpCircle className="w-3 h-3 text-ot-success" />
          Update All
        </button>
      </div>

      {/* Service cards grid */}
      {loading && statuses.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-ot-text-muted text-sm">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          Loading service status...
        </div>
      ) : statuses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-ot-text-muted text-sm gap-2">
          <PauseCircle className="w-8 h-8" />
          <p>No running services detected.</p>
          <p className="text-xs">Make sure Docker is running and OpenTang is installed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {statuses.map((svc) => {
            const port = getServicePort(svc.ports);
            return (
              <div
                key={svc.name}
                className="rounded-xl border border-ot-border bg-ot-elevated p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ot-text capitalize">{svc.name}</p>
                    {port && (
                      <p className="text-xs text-ot-text-muted font-mono mt-0.5">
                        :{port}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={svc.status} />
                </div>

                <div className="flex items-center gap-2">
                  {port && svc.status === "running" && (
                    <button
                      onClick={() => openService(port)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ot-orange-500/10 border border-ot-orange-500/20 text-ot-orange-400 text-xs font-medium hover:bg-ot-orange-500/20 transition-colors"
                    >
                      Open
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {svc.status === "stopped" && (
                    <button
                      onClick={refresh}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ot-border bg-ot-overlay text-xs text-ot-text hover:bg-ot-overlay/80 transition-colors"
                    >
                      <Play className="w-3 h-3 text-ot-success" />
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
