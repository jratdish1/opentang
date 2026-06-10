/**
 * Nova Reign Vault — Email Capture Component
 * Two-step flow: Age Verification → Email + OTP → Success
 * Matches Nova Reign brand: deep purple/black, neon accents
 *
 * Per SOP: "NOVA REIGN OFFICIAL VIDEO VAULT — JOIN THE VAULT
 * Get weekly updates, exclusive teasers, and first access to new content.
 * Drop your email — we'll send a quick verification code."
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, CheckCircle2, Lock, Eye, EyeOff, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Step = "age" | "email" | "verify" | "success";

export default function NovaReignVault() {
  const [step, setStep] = useState<Step>("age");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: countData } = trpc.novaReign.getCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const submitEmail = trpc.novaReign.submitEmail.useMutation({
    onSuccess: () => {
      toast.success("Verification code sent!", {
        description: `Check ${email} for your 6-digit vault access code.`,
      });
      setStep("verify");
    },
    onError: (err) => {
      toast.error("Failed to send code", { description: err.message });
    },
  });

  const verifyOtp = trpc.novaReign.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        toast.success("You're already in the vault!", {
          description: "Watch for your next Nova Reign update.",
        });
      } else {
        toast.success("Welcome to the vault!", {
          description: "Your first update is on its way.",
        });
      }
      setStep("success");
    },
    onError: (err) => {
      toast.error("Verification failed", { description: err.message });
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const handleAgeConfirm = () => {
    setAgeConfirmed(true);
    setStep("email");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    submitEmail.mutate({ email: email.trim(), ageVerified: true });
  };

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every((d) => d !== "")) {
      verifyOtp.mutate({ email, code: newCode.join("") });
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      verifyOtp.mutate({ email, code: pasted });
    }
  };

  const fadeSlide = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  return (
    <section
      id="nova-vault"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0008 0%, #0d000f 50%, #0a0008 100%)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(155,31,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold tracking-[0.4em] uppercase mb-3"
            style={{ color: "#9B1FFF" }}
          >
            Nova Reign Official
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            VIDEO VAULT
          </h2>
          <p className="text-lg" style={{ color: "#ddc8ee" }}>
            Get weekly updates, exclusive teasers, and first access to new content.
          </p>
          {countData && countData.count > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Users className="w-4 h-4" style={{ color: "#9B1FFF" }} />
              <span className="text-sm font-semibold" style={{ color: "#aa88cc" }}>
                {countData.count.toLocaleString()} members in the vault
              </span>
            </div>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#120010",
            border: "1px solid rgba(155,31,255,0.3)",
            boxShadow: "0 0 60px rgba(155,31,255,0.08)",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Age Verification ── */}
            {step === "age" && (
              <motion.div key="age" {...fadeSlide} className="p-8 sm:p-10 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "rgba(155,31,255,0.15)", border: "1px solid rgba(155,31,255,0.4)" }}
                >
                  <Shield className="w-8 h-8" style={{ color: "#9B1FFF" }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Age Verification Required</h3>
                <p className="mb-8" style={{ color: "#aa88cc" }}>
                  The Nova Reign Vault contains mature content. You must be{" "}
                  <strong className="text-white">18 years or older</strong> to enter.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleAgeConfirm}
                    className="px-8 py-3 rounded-xl font-bold text-white transition-all duration-150 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #7B0FDF 0%, #9B1FFF 100%)",
                      boxShadow: "0 4px 20px rgba(155,31,255,0.4)",
                    }}
                  >
                    I am 18 or older — Enter
                  </button>
                  <button
                    className="px-8 py-3 rounded-xl font-bold transition-all duration-150 active:scale-95"
                    style={{
                      background: "rgba(155,31,255,0.08)",
                      border: "1px solid rgba(155,31,255,0.3)",
                      color: "#aa88cc",
                    }}
                    onClick={() => window.history.back()}
                  >
                    I am under 18 — Exit
                  </button>
                </div>
                <p className="mt-6 text-xs" style={{ color: "#664477" }}>
                  By entering, you confirm you are 18+ and agree to receive Nova Reign content updates.
                </p>
              </motion.div>
            )}

            {/* ── STEP 2: Email Input ── */}
            {step === "email" && (
              <motion.div key="email" {...fadeSlide} className="p-8 sm:p-10">
                <div className="text-center mb-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(155,31,255,0.15)", border: "1px solid rgba(155,31,255,0.4)" }}
                  >
                    <Mail className="w-8 h-8" style={{ color: "#9B1FFF" }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Join the Vault</h3>
                  <p style={{ color: "#aa88cc" }}>
                    Drop your email — we'll send a quick verification code.
                  </p>
                </div>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-[#664477] outline-none transition-all"
                    style={{
                      background: "#0a0008",
                      border: "1px solid rgba(155,31,255,0.4)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(155,31,255,0.8)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "rgba(155,31,255,0.4)")
                    }
                  />
                  <button
                    type="submit"
                    disabled={submitEmail.isPending || !email.trim()}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #7B0FDF 0%, #9B1FFF 100%)",
                      boxShadow: "0 4px 20px rgba(155,31,255,0.4)",
                    }}
                  >
                    {submitEmail.isPending ? "Sending Code..." : "Send Verification Code →"}
                  </button>
                </form>
                <p className="mt-4 text-xs text-center" style={{ color: "#664477" }}>
                  No spam. Unsubscribe anytime. Your email is never shared.
                </p>
              </motion.div>
            )}

            {/* ── STEP 3: OTP Verification ── */}
            {step === "verify" && (
              <motion.div key="verify" {...fadeSlide} className="p-8 sm:p-10">
                <div className="text-center mb-8">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(155,31,255,0.15)", border: "1px solid rgba(155,31,255,0.4)" }}
                  >
                    <Lock className="w-8 h-8" style={{ color: "#9B1FFF" }} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Enter Your Code</h3>
                  <p style={{ color: "#aa88cc" }}>
                    We sent a 6-digit code to{" "}
                    <strong className="text-white">{email}</strong>
                  </p>
                </div>

                {/* 6-box OTP input */}
                <div
                  className="flex gap-2 sm:gap-3 justify-center mb-6"
                  onPaste={handleCodePaste}
                >
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold text-white rounded-xl outline-none transition-all"
                      style={{
                        background: "#0a0008",
                        border: digit
                          ? "2px solid #9B1FFF"
                          : "2px solid rgba(155,31,255,0.3)",
                        boxShadow: digit ? "0 0 12px rgba(155,31,255,0.3)" : "none",
                      }}
                    />
                  ))}
                </div>

                {verifyOtp.isPending && (
                  <p className="text-center text-sm mb-4" style={{ color: "#9B1FFF" }}>
                    Verifying...
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setCode(["", "", "", "", "", ""]);
                      setStep("email");
                    }}
                    className="px-6 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(155,31,255,0.08)",
                      border: "1px solid rgba(155,31,255,0.3)",
                      color: "#aa88cc",
                    }}
                  >
                    ← Change Email
                  </button>
                  <button
                    onClick={() => submitEmail.mutate({ email, ageVerified: true })}
                    disabled={submitEmail.isPending}
                    className="px-6 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: "rgba(155,31,255,0.08)",
                      border: "1px solid rgba(155,31,255,0.3)",
                      color: "#aa88cc",
                    }}
                  >
                    {submitEmail.isPending ? "Resending..." : "Resend Code"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Success ── */}
            {step === "success" && (
              <motion.div key="success" {...fadeSlide} className="p-8 sm:p-10 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: "linear-gradient(135deg, #7B0FDF 0%, #9B1FFF 100%)",
                    boxShadow: "0 0 40px rgba(155,31,255,0.5)",
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-black text-white mb-3">You're In the Vault</h3>
                <p className="text-lg mb-6" style={{ color: "#ddc8ee" }}>
                  Welcome to the Nova Reign inner circle. Your first update is on its way.
                </p>
                {countData && countData.count > 0 && (
                  <p className="text-sm mb-6" style={{ color: "#9B1FFF" }}>
                    You're vault member #{countData.count.toLocaleString()}
                  </p>
                )}
                <a
                  href="https://novareign.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 rounded-xl font-bold text-white transition-all duration-150 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #7B0FDF 0%, #9B1FFF 100%)",
                    boxShadow: "0 4px 20px rgba(155,31,255,0.4)",
                  }}
                >
                  Visit novareign.ai →
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
