// $HERO Animated NFT Collection — CollectionSection Component
// Design: "Heroes Hall of Honor" — Cinematic Blockbuster Showcase
// All 10 animated NFTs now fully live — no "coming soon" section needed

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Flame, Heart, Swords, Wrench, Globe } from "lucide-react";
import { animatedNFTs, type AnimatedNFT } from "@/lib/nftData";

const NAVY_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/n6wZKBCrhC57u7dtf5EHg8/navy_texture_bg-dFKR9hvA3CHGxGUNiDLPmM.webp";

const categoryIcons: Record<string, React.ElementType> = {
  Fire: Flame,
  Medical: Heart,
  Military: Swords,
  Rescue: Wrench,
  "Military Medical": Swords,
};

const rarityColors: Record<string, string> = {
  Common: "#6B7280",
  Uncommon: "#10B981",
  Rare: "#C9A84C",
  "Ultra Rare": "#7C3AED",
  Legendary: "#EF4444",
};

const chainColors: Record<string, string> = {
  PulseChain: "#9D4EDD",
  BASE: "#0052FF",
  Shared: "#C9A84C",
};

function AnimatedNFTCard({ nft, index }: { nft: AnimatedNFT; index: number }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — try muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          setMuted(true);
          videoRef.current.play();
        }
      });
    }
    setPlaying(!playing);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const Icon = categoryIcons[nft.category] || Globe;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateY: -5 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 5) * 0.12 }}
      className="group relative"
    >
      <div className="relative rounded-lg overflow-hidden bg-card border border-border hover:border-[#C9A84C]/60 transition-all duration-500 hover:shadow-[0_0_40px_oklch(0.75_0.12_85/0.18)]">
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A84C]/60 z-10 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A84C]/60 z-10 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A84C]/60 z-10 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A84C]/60 z-10 rounded-br-lg pointer-events-none" />

        {/* Video / Thumbnail */}
        <div
          className="relative aspect-[9/16] max-h-[420px] overflow-hidden cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={nft.videoUrl}
            poster={nft.thumbnailUrl}
            loop
            muted={muted}
            playsInline
            preload="metadata"
            onLoadedData={() => setLoaded(true)}
            onEnded={() => setPlaying(false)}
            className="w-full h-full object-cover"
          />

          {/* Loading shimmer */}
          {!loaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.15_0.02_260)] to-[oklch(0.20_0.03_260)] animate-pulse" />
          )}

          {/* Play overlay */}
          {!playing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/15 transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-[#C9A84C]/90 flex items-center justify-center shadow-[0_0_30px_#C9A84C/50] group-hover:scale-110 transition-transform duration-300">
                <Play className="w-7 h-7 text-[oklch(0.12_0.02_260)] ml-1" />
              </div>
            </div>
          )}

          {/* Controls when playing */}
          {playing && (
            <div className="absolute bottom-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
                aria-label="Pause"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Rarity badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded text-xs font-accent tracking-wider text-white z-10 shadow-md"
            style={{ backgroundColor: rarityColors[nft.rarity] }}
          >
            {nft.rarity.toUpperCase()}
          </div>

          {/* Chain badge */}
          <div
            className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-accent tracking-wider text-white z-10 shadow-md"
            style={{ backgroundColor: chainColors[nft.chain] + "CC" }}
          >
            {nft.chain.toUpperCase()}
          </div>
        </div>

        {/* Card Info */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg" role="img" aria-label={nft.country}>{nft.countryFlag}</span>
            <Icon className="w-4 h-4 text-gold" />
            <span className="text-xs font-accent tracking-wider text-muted-foreground uppercase">
              {nft.category}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
            {nft.name}
          </h3>
          <p className="text-xs font-accent tracking-wider text-gold mt-1">
            "{nft.codename}"
          </p>
          <p className="mt-2 text-sm font-body text-muted-foreground leading-relaxed line-clamp-2">
            {nft.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CollectionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="collection"
      ref={sectionRef}
      className="relative py-24 sm:py-32"
      style={{
        backgroundImage: `url(${NAVY_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[oklch(0.12_0.02_260/0.87)]" />

      <div className="relative z-10 container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold/80 uppercase">
            The Complete Collection
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            10 Animated <span className="gold-shimmer">Heroes</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base font-body text-muted-foreground">
            Every NFT is a looping animated video with patriotic orchestral music,
            honoring first responders and military heroes from 10 nations worldwide.
            Bold cartoon style. 8-second loops. ERC-721 on PulseChain and BASE.
          </p>

          {/* Stats bar */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { label: "Nations", value: "10" },
              { label: "Animated NFTs", value: "10" },
              { label: "Format", value: "MP4 Loop" },
              { label: "Chains", value: "PLS + BASE" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-display font-bold text-gold">{stat.value}</div>
                <div className="text-xs font-accent tracking-wider text-muted-foreground uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Animated NFT Grid — 2 cols mobile, 3 cols tablet, 5 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {animatedNFTs.map((nft, i) => (
            <AnimatedNFTCard key={nft.id} nft={nft} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="font-accent text-sm tracking-[0.3em] text-gold/70 uppercase mb-4">
            V2 Contract Deploying Soon
          </p>
          <a
            href="#mint"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[oklch(0.12_0.02_260)] font-accent font-bold tracking-wider text-sm uppercase hover:shadow-[0_0_40px_#C9A84C/40] transition-all duration-300 hover:scale-105"
          >
            <span>Join the Whitelist</span>
            <span className="text-base">→</span>
          </a>
        </motion.div>
      </div>

      {/* Bottom ribbon */}
      <div className="absolute bottom-0 left-0 right-0 ribbon-divider" />
    </section>
  );
}
