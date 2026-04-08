import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Flame, Heart, Swords, Wrench } from "lucide-react";
import { animatedNFTs, keyframeNFTs, type AnimatedNFT } from "@/lib/nftData";

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

function AnimatedNFTCard({ nft, index }: { nft: AnimatedNFT; index: number }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const Icon = categoryIcons[nft.category] || Flame;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateY: -5 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="group relative"
    >
      <div className="relative rounded-lg overflow-hidden bg-card border border-border hover:border-[#C9A84C]/50 transition-all duration-500 hover:shadow-[0_0_40px_oklch(0.75_0.12_85/0.15)]">
        {/* Gold corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A84C]/60 z-10 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A84C]/60 z-10 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A84C]/60 z-10 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A84C]/60 z-10 rounded-br-lg" />

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
            className="w-full h-full object-cover"
          />

          {/* Play overlay */}
          {!playing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#C9A84C]/90 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-[oklch(0.12_0.02_260)] ml-1" />
              </div>
            </div>
          )}

          {/* Controls */}
          {playing && (
            <div className="absolute bottom-3 right-3 flex gap-2 z-10">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Rarity badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded text-xs font-accent tracking-wider text-white z-10"
            style={{ backgroundColor: rarityColors[nft.rarity] }}
          >
            {nft.rarity.toUpperCase()}
          </div>

          {/* Chain badge */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 text-[10px] font-accent tracking-wider text-gold-light z-10">
            {nft.chain.toUpperCase()}
          </div>
        </div>

        {/* Card Info */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{nft.countryFlag}</span>
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

function KeyframeCard({ nft, index }: { nft: typeof keyframeNFTs[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative rounded-lg overflow-hidden bg-card border border-border/50 hover:border-[#C9A84C]/30 transition-all duration-300">
        <div className="relative aspect-[9/16] max-h-[320px] overflow-hidden">
          <img
            src={nft.thumbnailUrl}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{nft.countryFlag}</span>
              <span className="text-xs font-accent tracking-wider text-gold-light">
                {nft.category.toUpperCase()}
              </span>
            </div>
            <h4 className="font-display text-sm font-semibold text-white mt-1">
              {nft.name}
            </h4>
          </div>
          {/* Status badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#C9A84C]/20 border border-[#C9A84C]/40 text-[9px] font-accent tracking-wider text-gold-light">
            COMING SOON
          </div>
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
      <div className="absolute inset-0 bg-[oklch(0.12_0.02_260/0.85)]" />

      <div className="relative z-10 container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold/80 uppercase">
            The Collection
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            Animated <span className="gold-shimmer">Heroes</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base font-body text-muted-foreground">
            Each NFT is a looping animated video with patriotic orchestral music,
            featuring heroes from around the world in bold cartoon style.
          </p>
        </motion.div>

        {/* Animated NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {animatedNFTs.map((nft, i) => (
            <AnimatedNFTCard key={nft.id} nft={nft} index={i} />
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold/60 uppercase">
            More Heroes Coming
          </span>
          <h3 className="mt-3 text-2xl sm:text-3xl font-display font-semibold text-foreground">
            Ready for Animation
          </h3>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {keyframeNFTs.map((nft, i) => (
            <KeyframeCard key={nft.id} nft={nft} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom ribbon */}
      <div className="absolute bottom-0 left-0 right-0 ribbon-divider" />
    </section>
  );
}
