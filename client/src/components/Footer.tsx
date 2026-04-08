import { Shield, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border/30">
      <div className="container py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[oklch(0.12_0.02_260)]" />
            </div>
            <span className="font-accent text-lg tracking-[0.2em] text-gold-light">
              $HERO NFT
            </span>
          </div>

          {/* Center text */}
          <div className="text-center">
            <p className="text-sm font-body text-muted-foreground flex items-center gap-1.5">
              Built with <Heart className="w-3.5 h-3.5 text-[#8B0000]" /> for heroes worldwide
            </p>
            <p className="text-xs font-body text-muted-foreground/60 mt-1">
              ERC-721 on PulseChain & BASE &middot; 25% to veteran charities
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-body text-muted-foreground/50">
              &copy; {new Date().getFullYear()} $HERO Collection
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
