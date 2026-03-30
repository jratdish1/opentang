import { create } from "zustand";

export interface CheckItem {
  id: string;
  label: string;
  status: "Pass" | "Warn" | "Fail";
  message: string;
}

export interface SystemCheckResult {
  os: string;
  os_version: string;
  arch: string;
  ram_gb: number;
  ram_available_gb: number;
  disk_gb: number;
  disk_available_gb: number;
  docker_installed: boolean;
  docker_version: string | null;
  docker_running: boolean;
  wsl2_available: boolean;
  checks: CheckItem[];
}

interface WizardState {
  currentStep: number;
  completedSteps: number[];

  // System check result from M2
  systemCheck: SystemCheckResult | null;

  // User selections (populated across wizard steps)
  edition: "nanoclaw" | "hermes" | "openclaw" | null;
  llmMode: "local" | "cloud" | "skip" | null;
  selectedPackages: string[];
  networkMode: "local" | "lan" | "internet" | null;

  // Navigation actions
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (step: number) => void;

  // Selection setters
  setSystemCheck: (result: SystemCheckResult) => void;
  setEdition: (edition: WizardState["edition"]) => void;
  setLlmMode: (mode: WizardState["llmMode"]) => void;
  togglePackage: (pkg: string) => void;
  setNetworkMode: (mode: WizardState["networkMode"]) => void;
}

export const TOTAL_STEPS = 9; // Steps 0–8

export const useWizardStore = create<WizardState>()((set) => ({
  currentStep: 0,
  completedSteps: [],

  systemCheck: null,

  edition: null,
  llmMode: null,
  selectedPackages: [],
  networkMode: null,

  goToStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),

  setSystemCheck: (result) => set({ systemCheck: result }),
  setEdition: (edition) => set({ edition }),
  setLlmMode: (llmMode) => set({ llmMode }),
  setNetworkMode: (networkMode) => set({ networkMode }),

  togglePackage: (pkg) =>
    set((state) => ({
      selectedPackages: state.selectedPackages.includes(pkg)
        ? state.selectedPackages.filter((p) => p !== pkg)
        : [...state.selectedPackages, pkg],
    })),
}));
