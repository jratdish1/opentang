import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useWizardStore, InstallState } from "./store/useWizardStore";
import Step0Welcome from "./components/wizard/steps/Step0Welcome";
import WizardShell from "./components/wizard/WizardShell";
import ManagementShell from "./components/management/ManagementShell";

export default function App() {
  const { currentStep, appMode, setAppMode, setInstallState, setInstallPath } =
    useWizardStore();

  // On launch, check if OpenTang is already installed by reading the state file.
  // If found, skip the wizard and go straight to management mode.
  useEffect(() => {
    invoke<InstallState | null>("load_install_state", { installPath: "~/.opentang" })
      .then((state) => {
        if (state) {
          setInstallState(state);
          setInstallPath(state.installPath);
          setAppMode("management");
        }
      })
      .catch(() => {
        // No state file or error — start wizard as normal
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (appMode === "management") {
    return <ManagementShell />;
  }

  // Step 0 is the full-screen welcome splash. All subsequent steps
  // live inside the WizardShell with the sidebar navigation.
  if (currentStep === 0) {
    return <Step0Welcome />;
  }

  return <WizardShell />;
}
