import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { useWizardStore } from "../../../store/useWizardStore";
import { Button } from "../../shared/Button";

export default function Step0Welcome() {
  const { nextStep, completeStep } = useWizardStore();

  function handleBeginSetup() {
    completeStep(0);
    nextStep();
  }

  return (
    <div className="min-h-screen w-screen bg-ot-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl px-8 flex flex-col items-center">
        {/* Version badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-10 rounded-full bg-ot-elevated border border-ot-border text-ot-orange-500 text-xs font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-ot-orange-500 animate-orange-pulse" />
          v0.1.0 — Early Access
        </span>

        {/* Logo / Title */}
        <img
          src="/src/assets/logo-wordmark.png"
          alt="OpenTang"
          style={{ maxWidth: "320px" }}
          className="mx-auto mb-6"
        />

        {/* Tagline */}
        <p className="text-2xl font-semibold text-ot-orange-500 mb-5">
          Your stack. Your rules.
        </p>

        {/* Subtext */}
        <p className="text-ot-text-secondary text-lg leading-relaxed mb-12 max-w-lg">
          The open-source self-hosted AI + developer environment bootstrapper.
          Docker, LLMs, and your entire dev stack — installed in minutes, not days.
        </p>

        {/* Primary CTA */}
        <Button size="lg" onClick={handleBeginSetup} className="text-base px-10 py-4 shadow-lg">
          Begin Setup
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Secondary links */}
        <div className="mt-10 flex items-center gap-6 text-sm text-ot-text-muted">
          <a
            href="https://opentang.koba42.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-ot-text transition-colors duration-150"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Documentation
          </a>
          <span className="text-ot-border">|</span>
          <a
            href="https://github.com/Koba42/opentang"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-ot-text transition-colors duration-150"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-ot-text-muted text-xs font-mono">
          Built by Koba42 Corp &nbsp;&middot;&nbsp; Apache 2.0 &nbsp;&middot;&nbsp; koba42.com
        </p>
      </div>
    </div>
  );
}
