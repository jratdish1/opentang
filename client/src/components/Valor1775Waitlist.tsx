import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, CheckCircle, Loader2, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

type Step = "email" | "otp" | "success";

interface Valor1775WaitlistProps {
  onClose?: () => void;
}

export function Valor1775Waitlist({ onClose }: Valor1775WaitlistProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const submitEmail = trpc.valor1775.submitEmail.useMutation({
    onSuccess: () => {
      setStep("otp");
      toast.success("Verification code sent! Check your inbox.");
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "TOO_MANY_REQUESTS") {
        toast.error("Too many requests. Please wait a few minutes.");
      } else if (err.data?.code === "CONFLICT") {
        toast.info("This email is already on the waitlist!");
      } else {
        toast.error("Failed to send code. Please try again.");
      }
    },
  });

  const verifyOtp = trpc.valor1775.verifyOtp.useMutation({
    onSuccess: (data: { success: boolean; alreadySubscribed: boolean; subscriberCount: number }) => {
      setSubscriberCount(data.subscriberCount ?? null);
      setStep("success");
      toast.success("Welcome to Valor 1775!");
    },
    onError: (err: TRPCClientErrorLike<AppRouter>) => {
      if (err.data?.code === "TOO_MANY_REQUESTS") {
        toast.error("Too many attempts. Please request a new code.");
        setOtp(["", "", "", "", "", ""]);
        setStep("email");
      } else if (err.data?.code === "BAD_REQUEST") {
        toast.error("Invalid or expired code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        toast.error("Verification failed. Please try again.");
      }
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits are entered
    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      verifyOtp.mutate({ email, code: newOtp.join("") });
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      verifyOtp.mutate({ email, code: pasted });
    }
  };

  return (
    <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-6 shadow-2xl shadow-yellow-500/10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <Star className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-black text-white text-lg">VALOR</span>
          <span className="font-black text-yellow-500 text-lg">1775</span>
        </div>
        <p className="text-gray-500 text-xs tracking-widest uppercase">
          Strength. Purpose. Honor.
        </p>
      </div>

      {/* Step: Email */}
      {step === "email" && (
        <div className="space-y-4">
          <div className="text-center">
            <Mail className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-black text-white mb-1">Join the Waitlist</h3>
            <p className="text-gray-400 text-sm">
              Get early access and exclusive research updates from Valor 1775.
            </p>
          </div>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && email && submitEmail.mutate({ email })}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:border-yellow-500"
            disabled={submitEmail.isPending}
          />
          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
            disabled={!email || submitEmail.isPending}
            onClick={() => submitEmail.mutate({ email })}
          >
            {submitEmail.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Code...</>
            ) : (
              <><Mail className="w-4 h-4 mr-2" /> Send Verification Code</>
            )}
          </Button>
          <p className="text-gray-600 text-xs text-center">
            We'll send a 6-digit code to verify your email. No spam, ever.
          </p>
        </div>
      )}

      {/* Step: OTP */}
      {step === "otp" && (
        <div className="space-y-4">
          <div className="text-center">
            <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-black text-white mb-1">Enter Your Code</h3>
            <p className="text-gray-400 text-sm">
              We sent a 6-digit code to <span className="text-yellow-400">{email}</span>
            </p>
          </div>

          <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-11 h-14 text-center text-xl font-black bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                disabled={verifyOtp.isPending}
              />
            ))}
          </div>

          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
            disabled={otp.some((d) => !d) || verifyOtp.isPending}
            onClick={() => verifyOtp.mutate({ email, code: otp.join("") })}
          >
            {verifyOtp.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
            ) : (
              <><CheckCircle className="w-4 h-4 mr-2" /> Verify & Join</>
            )}
          </Button>

          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <button
              onClick={() => submitEmail.mutate({ email })}
              disabled={submitEmail.isPending}
              className="text-yellow-500 hover:text-yellow-400 text-xs transition-colors disabled:opacity-50"
            >
              {submitEmail.isPending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === "success" && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-2">Semper Fidelis!</h3>
            <p className="text-gray-400 text-sm mb-1">
              You're verified and on the Valor 1775 waitlist.
            </p>
            {subscriberCount && (
              <p className="text-yellow-500 text-sm font-semibold">
                You're subscriber #{subscriberCount} — Oorah!
              </p>
            )}
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
            Watch for exclusive research updates and early access notifications at{" "}
            <span className="text-yellow-400">{email}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 text-gray-400 hover:text-white text-xs"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just joined the @Valor1775 research waitlist! Strength. Purpose. Honor. 🇺🇸 #Valor1775 #SemperFi")}`, "_blank")}
            >
              Share on X
            </Button>
            {onClose && (
              <Button
                size="sm"
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs"
                onClick={onClose}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
