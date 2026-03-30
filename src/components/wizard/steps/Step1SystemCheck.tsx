import { useEffect, useState } from "react";
import { Monitor, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
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

  useEffect(() => {
    runCheck();
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
                  <li key={check.id} className="flex items-start gap-3 py-2 border-b border-ot-border-subtle last:border-0">
                    <CheckIcon status={check.status} />
                    <div className="flex-1 min-w-0">
                      <span className="text-ot-text text-sm font-medium">{check.label}</span>
                      <p className="text-ot-text-secondary text-xs mt-0.5">{check.message}</p>
                    </div>
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
                  <Button variant="ghost" onClick={runCheck}>
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
        <Button onClick={handleContinue} disabled={scanning || hasFail}>
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
