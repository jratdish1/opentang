import {
  Home,
  Monitor,
  Layers,
  Cpu,
  Package,
  Globe,
  Shield,
  Download,
  PartyPopper,
  Check,
} from "lucide-react";
import { useWizardStore } from "../../store/useWizardStore";

interface StepDefinition {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepDefinition[] = [
  { id: 0, label: "Welcome",      icon: Home },
  { id: 1, label: "System Check", icon: Monitor },
  { id: 2, label: "Edition",      icon: Layers },
  { id: 3, label: "LLM Config",   icon: Cpu },
  { id: 4, label: "Packages",     icon: Package },
  { id: 5, label: "Network",      icon: Globe },
  { id: 6, label: "Security",     icon: Shield },
  { id: 7, label: "Install",      icon: Download },
  { id: 8, label: "Done",         icon: PartyPopper },
];

export default function StepNav() {
  const { currentStep, completedSteps, goToStep } = useWizardStore();

  return (
    <nav className="w-60 min-h-screen flex-shrink-0 bg-ot-surface border-r border-ot-border flex flex-col">
      {/* Brand header */}
      <div className="px-5 py-5 border-b border-ot-border-subtle flex flex-col items-center">
        <button
          onClick={() => goToStep(0)}
          className="flex flex-col items-center hover:opacity-80 transition-opacity"
        >
          <img
            src="/src/assets/logo-mark.png"
            alt="OpenTang"
            style={{ width: "40px" }}
            className="mb-4"
          />
          <p className="text-ot-text-muted text-xs font-mono">v0.1.0</p>
        </button>
      </div>

      {/* Step list */}
      <div className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left",
                "transition-all duration-150 ease-in-out",
                isActive
                  ? "bg-ot-elevated text-ot-text font-semibold border-l-2 border-ot-orange-500 rounded-l-none pl-[10px]"
                  : isCompleted
                  ? "text-ot-text hover:bg-ot-elevated"
                  : "text-ot-text-muted hover:bg-ot-elevated hover:text-ot-text-secondary",
              ].join(" ")}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Step number / status indicator */}
              <span
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                  isActive
                    ? "bg-ot-orange-500 text-ot-text-inverse"
                    : isCompleted
                    ? "bg-ot-success text-ot-text-inverse"
                    : "bg-ot-elevated text-ot-text-muted border border-ot-border",
                ].join(" ")}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span>{step.id + 1}</span>
                )}
              </span>

              {/* Label + icon */}
              <span className="flex items-center gap-2 min-w-0">
                <Icon
                  className={[
                    "w-4 h-4 flex-shrink-0",
                    isActive
                      ? "text-ot-orange-500"
                      : isCompleted
                      ? "text-ot-success"
                      : "text-ot-text-muted",
                  ].join(" ")}
                />
                <span className="truncate">{step.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-ot-border-subtle">
        <p className="text-ot-text-muted text-xs">
          Koba42 Corp &copy; 2026
        </p>
        <p className="text-ot-text-muted text-xs mt-0.5">Apache 2.0</p>
      </div>
    </nav>
  );
}
