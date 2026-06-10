import { motion } from "framer-motion";
import { ChevronDown, Zap, Globe, Shield } from "lucide-react";
import { collectionStats } from "@/lib/nftData";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/n6wZKBCrhC57u7dtf5EHg8/hero_banner_bg-4VFsKsDE6rwY2sUoDhGmUf.webp";

const stats = [
  { label: "Total Supply", value: collectionStats.totalSupply.toString(), icon: Shield },
  { label: "Blockchains", value: "2", icon: Zap },
  { label: "Countries", value: "50+", icon: Globe },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="$HERO NFT banner — animated first responder and military hero NFT collection on PulseChain and BASE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.02_260/0.4)] via-[oklch(0.12_0.02_260/0.6)] to-[oklch(0.12_0.02_260)]" />
      </div>

      {/* Floating gold particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#C9A84C]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold-light/80 uppercase">
            ERC-721 on PulseChain & BASE
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 text-5xl sm:text-6xl lg:text-8xl font-display font-bold leading-[0.95] tracking-tight"
        >
          <span className="text-foreground">$HERO</span>
          <br />
          <span className="gold-shimmer">Animated NFT</span>
          <br />
          <span className="text-foreground">Collection</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl font-body text-muted-foreground leading-relaxed"
        >
          Honoring heroes worldwide — firefighters, paramedics, military, and first
          responders — immortalized as animated cartoon-style NFTs with patriotic orchestral music.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#collection"
            className="px-8 py-4 font-accent text-base tracking-[0.2em] bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded shadow-lg hover:shadow-[0_0_30px_oklch(0.75_0.12_85/0.5)] transition-all duration-300 hover:scale-105"
          >
            EXPLORE COLLECTION
          </a>
          <a
            href="#utility"
            className="px-8 py-4 font-accent text-base tracking-[0.2em] border-2 border-[#C9A84C]/40 text-gold-light rounded hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all duration-300"
          >
            VIEW UTILITY
          </a>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-gold" />
              <div className="text-left">
                <div className="font-accent text-2xl sm:text-3xl tracking-wider text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs font-body text-muted-foreground tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-gold/50" />
      </motion.div>

      {/* Ribbon divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 ribbon-divider" />
    </section>
  );
}
