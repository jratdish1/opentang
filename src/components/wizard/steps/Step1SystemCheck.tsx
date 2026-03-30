import { useEffect, useRef, useState } from "react";
import { Monitor, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2, Package } from "lucide-react";
import { useWizardStore, SystemCheckResult, CheckItem } from "../../../store/useWizardStore";
import { Button } from "../../shared/Button";
import { Card } from "../../shared/Card";

// Mock data for browser dev mode (outside Tauri window)
const MOCK_RESULT: SystemCheckResult = {
  os: "linux",
  os_version: "Dev Mode — mock data",
  arch: "x86_64",
  ram_gb: 16,
  ram_available_gb: 10.2,
  disk_gb: 500,
  disk_available_gb: 120,
  docker_installed: true,
  docker_version: "24.0.7",
  docker_running: true,
  wsl2_available: false,
  checks: [
    { id: "docker-installed", label: "Docker installed", status: "Pass", message: "Docker 24.0.7 detected" },
    { id: "docker-running", label: "Docker daemon", status: "Pass", message: "Docker daemon is running" },
    { id: "ram", label: "Available RAM", status: "Pass", message: "10.2 GB available (8 GB recommended)" },
    { id: "disk", label: "Free disk space", status: "Pass", message: "120 GB free (40 GB recommended)" },
    { id: "wsl2", label: "WSL2", status: "Pass", message: "Not required on this OS" },
  ],
};

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function CheckIcon({ status }: { status: CheckItem["status"] }) {
  if (status === "Pass") return <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />;
  if (status === "Warn") return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
}

export default function Step1SystemCheck() {
  const { nextStep, prevStep, completeStep, currentStep, setSystemCheck } = useWizardStore();
  const [result, setResult] = useState<SystemCheckResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dockerInstalling, setDockerInstalling] = useState(false);
  const [dockerProgress, setDockerProgress] = useState<string[]>([]);
  const [showManualInfo, setShowManualInfo] = useState(false);
  const unlistenRef = useRef<(() => void) | null>(null);

  async function runCheck() {
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      let data: SystemCheckResult;
      if (isTauri()) {
        const { invoke } = await import("@tauri-apps/api/core");
        data = await invoke<SystemCheckResult>("system_check");
      } else {
        // Simulate a brief scan delay in dev mode
        await new Promise((r) => setTimeout(r, 800));
        data = MOCK_RESULT;
      }
      setResult(data);
      setSystemCheck(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setScanning(false);
    }
  }

  async function installDocker() {
    setDockerInstalling(true);
    setDockerProgress([]);
    setShowManualInfo(false);

    if (!isTauri()) {
      setDockerProgress(["Simulating Docker install (dev mode)…"]);
      await new Promise((r) => setTimeout(r, 1500));
      setDockerProgress((prev) => [...prev, "Done (simulated). Re-running system check…"]);
      setDockerInstalling(false);
      runCheck();
      return;
    }

    const { invoke } = await import("@tauri-apps/api/core");
    const { listen } = await import("@tauri-apps/api/event");

    unlistenRef.current = await listen<string>("docker-install-progress", (event) => {
      setDockerProgress((prev) => [...prev, event.payload]);
    });

    try {
      await invoke("install_docker");
      const os = result?.os;
      if (os === "macos" || os === "windows") {
        setShowManualInfo(true);
      } else {
        // Linux: re-run check automatically after successful install
        await runCheck();
      }
    } catch (e) {
      setDockerProgress((prev) => [...prev, `Error: ${String(e)}`]);
    } finally {
      unlistenRef.current?.();
      unlistenRef.current = null;
      setDockerInstalling(false);
    }
  }

  useEffect(() => {
    runCheck();
    return () => {
      unlistenRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFail = result?.checks.some((c) => c.status === "Fail") ?? false;

  function handleContinue() {
    completeStep(currentStep);
    nextStep();
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Monitor className="w-6 h-6 text-ot-orange-500" />
          <h1 className="text-2xl font-bold text-ot-text">System Check</h1>
        </div>
        <p className="text-ot-text-secondary text-sm">
          We'll verify your machine meets all requirements before setup begins.
        </p>
      </div>

      {/* Main card */}
      <Card>
        <div className={scanning ? "animate-orange-pulse rounded-xl" : ""}>
          {scanning && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-14 h-14 rounded-full bg-ot-overlay border border-ot-orange-500 flex items-center justify-center animate-pulse">
                <Monitor className="w-7 h-7 text-ot-orange-500" />
              </div>
              <p className="text-ot-text font-semibold">Scanning your system…</p>
              <p className="text-ot-text-secondary text-sm">Checking Docker, RAM, and disk</p>
            </div>
          )}

          {error && !scanning && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <XCircle className="w-10 h-10 text-red-400" />
              <p className="text-ot-text font-semibold">System check failed</p>
              <p className="text-ot-text-secondary text-sm text-center max-w-sm">{error}</p>
              <Button variant="ghost" onClick={runCheck}>
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          )}

          {result && !scanning && (
            <div className="space-y-4">
              {/* Checklist */}
              <ul className="space-y-2">
                {result.checks.map((check) => (
                  <li key={check.id} className="py-2 border-b border-ot-border-subtle last:border-0">
                    <div className="flex items-start gap-3">
                      <CheckIcon status={check.status} />
                      <div className="flex-1 min-w-0">
                        <span className="text-ot-text text-sm font-medium">{check.label}</span>
                        <p className="text-ot-text-secondary text-xs mt-0.5">{check.message}</p>
                      </div>
                      {check.id === "docker-installed" && check.status === "Fail" && !dockerInstalling && !showManualInfo && (
                        <button
                          onClick={installDocker}
                          className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-ot-orange-500 hover:bg-ot-orange-600 text-white transition-colors flex-shrink-0"
                        >
                          <Package className="w-3 h-3" />
                          Install Docker
                        </button>
                      )}
                      {check.id === "docker-installed" && check.status === "Fail" && dockerInstalling && (
                        <div className="flex items-center gap-1.5 text-ot-text-secondary text-xs flex-shrink-0">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Installing…
                        </div>
                      )}
                    </div>

                    {/* Docker install progress — shown under the docker-installed row */}
                    {check.id === "docker-installed" && (dockerInstalling || dockerProgress.length > 0) && !showManualInfo && (
                      <div className="mt-2 ml-7 rounded bg-ot-overlay border border-ot-border p-3 space-y-1 max-h-36 overflow-y-auto">
                        {dockerProgress.map((msg, i) => (
                          <p key={i} className="text-xs text-ot-text-secondary font-mono leading-relaxed">{msg}</p>
                        ))}
                        {dockerInstalling && (
                          <p className="text-xs text-ot-orange-500 font-mono animate-pulse">…</p>
                        )}
                      </div>
                    )}

                    {/* Manual install info panel (macOS / Windows) */}
                    {check.id === "docker-installed" && showManualInfo && (
                      <div className="mt-2 ml-7 rounded bg-ot-overlay border border-ot-orange-500/40 p-3 space-y-2">
                        <p className="text-xs text-ot-text">
                          Your browser has been opened with installation instructions.
                          Complete the install, then click <strong>Retry</strong> below to re-run the system check.
                        </p>
                        <button
                          onClick={() => setShowManualInfo(false)}
                          className="text-xs text-ot-text-muted hover:text-ot-text underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* System info summary */}
              <div className="mt-4 pt-4 border-t border-ot-border grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-ot-text-muted">OS</span>
                  <span className="text-ot-text-secondary font-mono">{result.os_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ot-text-muted">Arch</span>
                  <span className="text-ot-text-secondary font-mono">{result.arch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ot-text-muted">Total RAM</span>
                  <span className="text-ot-text-secondary font-mono">{result.ram_gb.toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ot-text-muted">Total Disk</span>
                  <span className="text-ot-text-secondary font-mono">{result.disk_gb.toFixed(0)} GB</span>
                </div>
              </div>

              {/* Retry button if any failures */}
              {hasFail && (
                <div className="pt-2">
                  <Button variant="ghost" onClick={runCheck} disabled={dockerInstalling}>
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-6">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={scanning || hasFail || dockerInstalling}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
