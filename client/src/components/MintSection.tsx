import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Wallet, Shield, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function MintSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleMint = () => {
    toast("Minting coming soon!", {
      description: "Join the whitelist to get early access when minting goes live.",
    });
  };

  return (
    <section id="mint" ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold/80 uppercase">
            Join The Mission
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            Become a <span className="gold-shimmer">Hero</span> Holder
          </h2>
          <p className="mt-6 text-lg font-body text-muted-foreground leading-relaxed">
            Mint your animated NFT and join a community that honors the brave men and women
            who serve. 25% of all revenue goes directly to veteran and first responder charities.
          </p>

          {/* Mint Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 bg-card border-2 border-[#C9A84C]/30 rounded-lg p-8 relative overflow-hidden"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#C9A84C]/50 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#C9A84C]/50 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#C9A84C]/50 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#C9A84C]/50 rounded-br-lg" />

            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-gold" />
              <h3 className="font-display text-2xl font-bold text-foreground">
                Whitelist Open
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-[10px] font-accent tracking-wider text-muted-foreground uppercase">
                  Supply
                </div>
                <div className="font-accent text-2xl tracking-wider text-gold mt-1">555</div>
                <div className="text-xs text-muted-foreground">per chain</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-[10px] font-accent tracking-wider text-muted-foreground uppercase">
                  Chains
                </div>
                <div className="font-accent text-2xl tracking-wider text-gold mt-1">2</div>
                <div className="text-xs text-muted-foreground">PulseChain + BASE</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-[10px] font-accent tracking-wider text-muted-foreground uppercase">
                  Charity
                </div>
                <div className="font-accent text-2xl tracking-wider text-gold mt-1">25%</div>
                <div className="text-xs text-muted-foreground">to veterans</div>
              </div>
            </div>

            <button
              onClick={handleMint}
              className="w-full sm:w-auto px-10 py-4 font-accent text-base tracking-[0.2em] bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded shadow-lg hover:shadow-[0_0_30px_oklch(0.75_0.12_85/0.5)] transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
            >
              <Wallet className="w-5 h-5" />
              CONNECT WALLET TO MINT
            </button>

            <p className="mt-4 text-xs font-body text-muted-foreground">
              $HERO and $VETS token holders receive priority whitelist access
            </p>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {[
              { label: "Twitter / X", href: "#" },
              { label: "Discord", href: "#" },
              { label: "Telegram", href: "#" },
              { label: "PulseChain", href: "#" },
              { label: "BASE", href: "#" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  toast("Coming soon!", { description: `${link.label} link will be available at launch.` });
                }}
                className="px-4 py-2 text-sm font-body text-muted-foreground border border-border/50 rounded hover:border-[#C9A84C]/40 hover:text-gold-light transition-all duration-300 inline-flex items-center gap-2"
              >
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
