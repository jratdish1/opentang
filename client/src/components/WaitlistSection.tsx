import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, CheckCircle2, ArrowRight, RotateCcw, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Step = "email" | "verify" | "success";

export default function WaitlistSection() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: countData } = trpc.waitlist.getCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const submitEmail = trpc.waitlist.submitEmail.useMutation({
    onSuccess: (data) => {
      if (data.alreadySubscribed) {
        toast.success("You're already on the waitlist!", {
          description: "You'll be the first to know when $HERO NFT launches.",
        });
        setStep("success");
        return;
      }
      toast.success("Verification code sent!", {
        description: `Check ${email} for your 6-digit code.`,
      });
      setStep("verify");
    },
    onError: (err) => {
      toast.error("Failed to send code", { description: err.message });
    },
  });

  const verifyCode = trpc.waitlist.verifyCode.useMutation({
    onSuccess: () => {
      setStep("success");
      toast.success("You're on the list! 🎖️", {
        description: "Welcome to the $HERO NFT waitlist. Hero Letters incoming.",
      });
    },
    onError: (err) => {
      toast.error("Verification failed", { description: err.message });
      if (err.message.includes("expired") || err.message.includes("Too many")) {
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    submitEmail.mutate({ email: email.trim() });
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits entered
    if (value && index === 5 && next.every((d) => d !== "")) {
      verifyCode.mutate({ email, code: next.join("") });
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && code.every((d) => d !== "")) {
      verifyCode.mutate({ email, code: code.join("") });
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setCode(next);
      inputRefs.current[5]?.focus();
      verifyCode.mutate({ email, code: pasted });
    }
  };

  const handleResend = () => {
    setCode(["", "", "", "", "", ""]);
    submitEmail.mutate({ email });
  };

  return (
    <section id="waitlist" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.02_260)] via-[oklch(0.10_0.03_270)] to-[oklch(0.12_0.02_260)]" />
      {/* Gold glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container">
        <div className="max-w-xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="font-accent text-sm tracking-[0.4em] text-gold/80 uppercase">
              Early Access
            </span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-display font-bold text-foreground">
              Join the <span className="gold-shimmer">Hero Waitlist</span>
            </h2>
            <p className="mt-4 text-base font-body text-muted-foreground leading-relaxed">
              Be first in line for mint access, exclusive Hero Letters, and $HERO token holder perks. Verify your email to secure your spot.
            </p>
            {/* Subscriber count */}
            {countData && countData.count > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30"
              >
                <Users className="w-4 h-4 text-gold" />
                <span className="text-sm font-accent text-gold tracking-wider">
                  {countData.count.toLocaleString()} HERO{countData.count === 1 ? "" : "S"} ENLISTED
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-2xl"
          >
            <AnimatePresence mode="wait">
              {/* STEP 1: Email Input */}
              {step === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-accent text-sm tracking-wider text-foreground">Step 1 of 2</p>
                      <p className="text-xs text-muted-foreground">Enter your email address</p>
                    </div>
                  </div>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="waitlist-email" className="block text-sm font-body text-muted-foreground mb-2">
                        Email Address
                      </label>
                      <input
                        id="waitlist-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hero@example.com"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#C9A84C]/60 focus:ring-1 focus:ring-[#C9A84C]/30 transition-all duration-200 font-body text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitEmail.isPending || !email.trim()}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-accent text-sm tracking-[0.2em] bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded-lg shadow-lg hover:shadow-[0_0_30px_oklch(0.75_0.12_85/0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitEmail.isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          SENDING CODE...
                        </>
                      ) : (
                        <>
                          SEND VERIFICATION CODE
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                  <p className="mt-4 text-center text-xs text-muted-foreground/60">
                    <Shield className="w-3 h-3 inline mr-1" />
                    No spam. Hero Letters only. Unsubscribe anytime.
                  </p>
                </motion.div>
              )}

              {/* STEP 2: OTP Verification */}
              {step === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-accent text-sm tracking-wider text-foreground">Step 2 of 2</p>
                      <p className="text-xs text-muted-foreground">Enter the 6-digit code</p>
                    </div>
                  </div>
                  <p className="text-sm font-body text-muted-foreground mb-6">
                    We sent a verification code to{" "}
                    <span className="text-gold font-medium">{email}</span>. Enter it below to confirm your spot.
                  </p>
                  {/* OTP Input Grid */}
                  <div
                    className="flex gap-2 justify-center mb-6"
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
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-accent font-bold text-foreground bg-background border-2 border-border rounded-lg focus:outline-none focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/20 transition-all duration-200 caret-transparent"
                        style={{ letterSpacing: 0 }}
                        aria-label={`Digit ${i + 1} of verification code`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => verifyCode.mutate({ email, code: code.join("") })}
                    disabled={verifyCode.isPending || code.some((d) => d === "")}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-accent text-sm tracking-[0.2em] bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded-lg shadow-lg hover:shadow-[0_0_30px_oklch(0.75_0.12_85/0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {verifyCode.isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        VERIFYING...
                      </>
                    ) : (
                      <>
                        VERIFY & JOIN WAITLIST
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <button
                      onClick={() => { setStep("email"); setCode(["", "", "", "", "", ""]); }}
                      className="hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      ← Change email
                    </button>
                    <button
                      onClick={handleResend}
                      disabled={submitEmail.isPending}
                      className="hover:text-gold transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Resend code
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Success */}
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                    className="w-20 h-20 rounded-full bg-[#C9A84C]/15 border-2 border-[#C9A84C] flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-gold" />
                  </motion.div>
                  <h3 className="font-display text-3xl font-bold text-foreground mb-3">
                    Welcome, <span className="gold-shimmer">Hero</span>
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    You're officially on the <strong className="text-foreground">$HERO NFT waitlist</strong>. Hero Letters will be sent to{" "}
                    <span className="text-gold">{email}</span> with launch updates, exclusive mint access, and early holder perks.
                  </p>
                  {countData && countData.count > 0 && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30">
                      <Users className="w-4 h-4 text-gold" />
                      <span className="text-sm font-accent text-gold tracking-wider">
                        Hero #{countData.count.toLocaleString()} in line
                      </span>
                    </div>
                  )}
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">Spread the mission</p>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just joined the $HERO NFT waitlist — animated first responder and military hero NFTs on PulseChain and BASE. 🎖️\n\nherobase.io/nft")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 font-accent text-xs tracking-wider border border-[#C9A84C]/30 text-gold rounded-lg hover:bg-[#C9A84C]/10 hover:border-[#C9A84C] transition-all duration-200"
                    >
                      SHARE ON X (TWITTER)
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
