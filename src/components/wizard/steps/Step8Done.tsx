// OpenTang M5 — Done step with post-install health polling

import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  CheckCircle, ExternalLink, RotateCcw, BookOpen,
  XCircle, Loader, AlertTriangle,
} from "lucide-react";
import { useWizardStore, ServiceStatus, InstallState } from "../../../store/useWizardStore";
import { Button } from "../../shared/Button";
import { ServiceLink } from "../../../types/install";

// All possible services with their default ports
const ALL_SERVICE_LINKS: ServiceLink[] = [
  { id: "coolify",      name: "Coolify Dashboard",  port: 8000 },
  { id: "portainer",    name: "Portainer",           port: 9000 },
  { id: "gitea",        name: "Gitea",               port: 3000 },
  { id: "grafana",      name: "Grafana",             port: 3001 },
  { id: "prometheus",   name: "Prometheus",          port: 9090 },
  { id: "ollama",       name: "Ollama API",          port: 11434 },
  { id: "n8n",          name: "n8n",                 port: 5678 },
  { id: "uptime-kuma",  name: "Uptime Kuma",         port: 3003 },
  { id: "vaultwarden",  name: "Vaultwarden",         port: 8080 },
  { id: "nextcloud",    name: "Nextcloud",           port: 8081 },
  { id: "searxng",      name: "SearXNG",             port: 8082 },
];

const POLL_INTERVAL_MS = 3000;
const POLL_MAX = 20; // 20 × 3s = 60s

export default function Step8Done() {
  const {
    goToStep,
    selectedPackages,
    networkMode,
    networkConfig,
    edition,
    llmMode,
    installPath,
    serviceStatuses,
    setServiceStatuses,
    setAppMode,
    setInstallState,
  } = useWizardStore();

  // Track timed-out services (didn't come up within 60s)
  const [timedOut, setTimedOut] = useState<Set<string>>(new Set());
  const pollCountRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch service statuses and poll until all running or timeout
  async function fetchStatuses() {
    try {
      const statuses = await invoke<ServiceStatus[]>("get_service_status", { installPath });
      setServiceStatuses(statuses);
      return statuses;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    fetchStatuses();

    pollTimerRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      const statuses = await fetchStatuses();

      // Check if all visible services are running
      const visibleIds = getVisibleLinks().map((l) => l.id);
      const allRunning = visibleIds.every((id) =>
        statuses?.some((s) => (s.name === id || s.name.includes(id)) && s.status === "running")
      );

      if (allRunning || pollCountRef.current >= POLL_MAX) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        // Mark any non-running services as timed out
        if (pollCountRef.current >= POLL_MAX && statuses) {
          const notRunning = visibleIds.filter(
            (id) => !statuses.some((s) => (s.name === id || s.name.includes(id)) && s.status === "running")
          );
          if (notRunning.length > 0) {
            setTimedOut(new Set(notRunning));
          }
        }
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [installPath]); // eslint-disable-line react-hooks/exhaustive-deps

  function getBaseUrl(port: number) {
    if (networkMode === "internet" && networkConfig?.domain) {
      return `https://${networkConfig.domain}`;
    }
    if (networkMode === "lan" && networkConfig?.localIp) {
      return `http://${networkConfig.localIp}:${port}`;
    }
    return `http://localhost:${port}`;
  }

  function getLiveStatus(id: string): ServiceStatus["status"] | "starting" | "timeout" | null {
    if (timedOut.has(id)) return "timeout";
    if (serviceStatuses.length === 0) return null; // still loading
    const match = serviceStatuses.find((s) => s.name === id || s.name.includes(id));
    if (!match) return "starting";
    if (match.status === "running") return "running";
    if (match.status === "error") return "error";
    return "starting";
  }

  function getVisibleLinks(): ServiceLink[] {
    return ALL_SERVICE_LINKS.filter(({ id }) => {
      if (id === "coolify") return true;
      if (id === "ollama") return llmMode === "local";
      return selectedPackages.includes(id);
    });
  }

  const visibleLinks = getVisibleLinks();

  const editionName =
    edition === "nanoclaw" ? "NanoClaw" :
    edition === "hermes" ? "Hermes" :
    edition === "openclaw" ? "OpenClaw" : "OpenTang";

  // Build the list of all installed package ids
  const installedPackages = [
    ...(edition ? [edition] : []),
    "coolify",
    ...selectedPackages,
    ...(llmMode === "local" ? ["ollama"] : []),
  ];

  async function openDashboard() {
    // Persist install state so future launches skip the wizard
    const state: InstallState = {
      version: "0.1.0",
      installedAt: new Date().toISOString(),
      edition: edition ?? "openclaw",
      installPath,
      networkMode: networkMode ?? "local",
      domain: networkConfig?.domain ?? null,
      installedPackages,
    };

    try {
      await invoke("save_install_state", { state, installPath });
    } catch {
      // Non-fatal — still transition to management mode
    }

    setInstallState(state);
    setAppMode("management");
  }

  async function viewLogs(id: string) {
    try {
      const { openUrl: open } = await import("@tauri-apps/plugin-opener");
      await open(`http://localhost:9000/#!/2/docker/containers`);
    } catch {
      window.open(`http://localhost:9000`, "_blank", "noreferrer");
    }
    void id; // logs link goes to Portainer container view
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ot-success/10 border border-ot-success/30 mb-6">
          <CheckCircle className="w-10 h-10 text-ot-success" />
        </div>
        <h1 className="text-3xl font-bold text-ot-text mb-2">OpenTang is ready!</h1>
        <p className="text-ot-orange-400 font-medium">Your self-hosted AI stack is up and running.</p>
        <p className="text-ot-text-secondary text-sm mt-1">
          Edition: {editionName} · {visibleLinks.length} services installed
        </p>
      </div>

      {/* Installed services with live health */}
      <div className="rounded-xl border border-ot-border bg-ot-elevated overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-ot-border">
          <span className="text-xs font-semibold text-ot-text-secondary uppercase tracking-wider">Installed services</span>
        </div>
        {visibleLinks.map(({ id, name, port }, i) => {
          const url = getBaseUrl(port);
          const liveStatus = getLiveStatus(id);
          return (
            <div
              key={id}
              className={[
                "flex items-center justify-between px-4 py-3",
                i !== visibleLinks.length - 1 ? "border-b border-ot-border" : "",
              ].join(" ")}
            >
              {/* Status icon + name */}
              <div className="flex items-center gap-3 min-w-0">
                {(liveStatus === null || liveStatus === "starting") && (
                  <Loader className="w-4 h-4 text-ot-text-muted flex-shrink-0 animate-spin" />
                )}
                {liveStatus === "running" && <CheckCircle className="w-4 h-4 text-ot-success flex-shrink-0" />}
                {liveStatus === "error" && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                {liveStatus === "timeout" && <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                <div className="min-w-0">
                  <span className="text-sm text-ot-text">{name}</span>
                  {liveStatus === "starting" && (
                    <span className="ml-2 text-xs text-ot-text-muted">starting...</span>
                  )}
                  {liveStatus === "timeout" && (
                    <span className="ml-2 text-xs text-yellow-500">timed out</span>
                  )}
                </div>
              </div>

              {/* URL + view logs */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {(liveStatus === "error" || liveStatus === "timeout") && (
                  <button
                    onClick={() => viewLogs(id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    View Logs
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-ot-orange-400 hover:text-ot-orange-300 transition-colors font-mono"
                >
                  :{port}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary CTA — enters management mode */}
      <button
        onClick={openDashboard}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-ot-orange-500 hover:bg-ot-orange-400 text-white font-semibold text-base transition-colors mb-3"
      >
        Open Dashboard
        <ExternalLink className="w-4 h-4" />
      </button>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => goToStep(4)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-ot-border bg-ot-elevated text-sm text-ot-text hover:bg-ot-overlay transition-colors"
        >
          Back to packages
        </button>
        <a
          href="#"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-ot-border bg-ot-elevated text-sm text-ot-text hover:bg-ot-overlay transition-colors"
        >
          <BookOpen className="w-4 h-4 text-ot-text-muted" />
          View documentation
        </a>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-ot-border">
        <p className="text-xs text-ot-text-muted">
          Powered by <span className="text-ot-orange-400 font-semibold">Koba42</span>
        </p>
        <Button variant="ghost" size="sm" onClick={() => goToStep(0)}>
          <RotateCcw className="w-3.5 h-3.5" />
          Start over
        </Button>
      </div>
    </div>
  );
}
