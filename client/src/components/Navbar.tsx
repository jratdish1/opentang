import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";

const navLinks = [
  { label: "Collection", href: "#collection" },
  { label: "Utility", href: "#utility" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Revenue", href: "#revenue" },
  { label: "Tech", href: "#tech" },
  { label: "Waitlist", href: "#waitlist" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[oklch(0.12_0.02_260/0.95)] backdrop-blur-xl shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_oklch(0.75_0.12_85/0.4)] transition-shadow duration-300">
            <Shield className="w-6 h-6 text-[oklch(0.12_0.02_260)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-accent text-xl tracking-[0.2em] text-gold-light leading-none">
              $HERO
            </span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase font-body">
              NFT Collection
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-body font-medium tracking-wide text-muted-foreground hover:text-gold-light transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gold group-hover:w-3/4 transition-all duration-300" />
            </a>
          ))}
          <a
            href="#mint"
            className="ml-4 px-6 py-2.5 font-accent text-sm tracking-[0.15em] bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded hover:shadow-[0_0_25px_oklch(0.75_0.12_85/0.4)] transition-all duration-300"
          >
            MINT NOW
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-gold-light"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[oklch(0.14_0.02_260/0.98)] backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="container py-6 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 text-base font-body font-medium text-muted-foreground hover:text-gold-light hover:bg-[oklch(0.2_0.03_260)] rounded transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#mint"
                onClick={() => setMobileOpen(false)}
                className="mt-2 py-3 px-6 font-accent text-center tracking-[0.15em] bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded"
              >
                MINT NOW
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
