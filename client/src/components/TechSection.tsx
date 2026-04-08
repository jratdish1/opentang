import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Code, Cpu, FileCode, Lock, Layers, Zap } from "lucide-react";
import { collectionStats } from "@/lib/nftData";

const CHAIN_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/n6wZKBCrhC57u7dtf5EHg8/chain_icons_bg-K6rNG6VesBWLT9YsaooKSf.webp";

const techSpecs = [
  { icon: Code, label: "Token Standard", value: collectionStats.tokenStandard },
  { icon: Layers, label: "Total Supply", value: `${collectionStats.totalSupply} per chain` },
  { icon: Cpu, label: "Art Style", value: collectionStats.artStyle },
  { icon: FileCode, label: "Media Format", value: collectionStats.mediaFormat },
  { icon: Zap, label: "Resolution", value: collectionStats.resolution },
  { icon: Lock, label: "Royalty", value: collectionStats.royalty },
];

const chainDetails = {
  PulseChain: {
    color: "#9333EA",
    description: "PulseChain offers near-zero gas fees and fast block times, making minting and trading accessible to everyone. $HERO token holders on PulseChain get priority whitelist access and discounted mint prices.",
    mintPrice: "TBD PLS",
    discount: "$HERO holders: 20% off",
  },
  BASE: {
    color: "#3B82F6",
    description: "BASE by Coinbase provides Ethereum L2 security with massive liquidity and marketplace access. OpenSea, Blur, and major NFT platforms fully support BASE collections.",
    mintPrice: "TBD ETH",
    discount: "$HERO holders: 20% off",
  },
};

export default function TechSection() {
  const [activeChain, setActiveChain] = useState<"PulseChain" | "BASE">("PulseChain");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const chain = chainDetails[activeChain];

  return (
    <section id="tech" ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <img src={CHAIN_BG} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold/80 uppercase">
            Under The Hood
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            Technical <span className="gold-shimmer">Specifications</span>
          </h2>
        </motion.div>

        {/* Tech Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {techSpecs.map((spec, i) => (
            <motion.div
              key={spec.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 text-center hover:border-[#C9A84C]/30 transition-all duration-300"
            >
              <spec.icon className="w-5 h-5 text-gold mx-auto mb-2" />
              <div className="text-[10px] font-accent tracking-wider text-muted-foreground uppercase mb-1">
                {spec.label}
              </div>
              <div className="text-sm font-body font-semibold text-foreground">
                {spec.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chain Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-card border border-border rounded-lg p-1">
              {(["PulseChain", "BASE"] as const).map((chain) => (
                <button
                  key={chain}
                  onClick={() => setActiveChain(chain)}
                  className={`px-6 py-2.5 font-accent text-sm tracking-[0.15em] rounded transition-all duration-300 ${
                    activeChain === chain
                      ? "text-[oklch(0.12_0.02_260)] shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={
                    activeChain === chain
                      ? { backgroundColor: chainDetails[chain].color }
                      : undefined
                  }
                >
                  {chain.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Chain Details Card */}
          <motion.div
            key={activeChain}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-8"
            style={{ borderColor: `${chain.color}30` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chain.color }}
              />
              <h3 className="font-display text-2xl font-bold text-foreground">
                {activeChain}
              </h3>
            </div>
            <p className="text-base font-body text-muted-foreground leading-relaxed mb-6">
              {chain.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-[10px] font-accent tracking-wider text-muted-foreground uppercase mb-1">
                  Mint Price
                </div>
                <div className="font-accent text-xl tracking-wider" style={{ color: chain.color }}>
                  {chain.mintPrice}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="text-[10px] font-accent tracking-wider text-muted-foreground uppercase mb-1">
                  Token Discount
                </div>
                <div className="text-sm font-body font-semibold text-gold-light">
                  {chain.discount}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smart Contract Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 bg-card/40 border border-border/30 rounded-lg p-6"
          >
            <h4 className="font-accent text-xs tracking-[0.3em] text-gold/80 uppercase mb-4">
              Smart Contract Architecture
            </h4>
            <div className="font-mono text-xs text-muted-foreground space-y-1.5 overflow-x-auto">
              <div><span className="text-gold">contract</span> HeroAnimatedNFT <span className="text-muted-foreground/60">is</span> ERC721, ERC2981, Ownable {"{"}</div>
              <div className="pl-4"><span className="text-[#9333EA]">uint256</span> <span className="text-foreground">public</span> MAX_SUPPLY = <span className="text-[#3B82F6]">555</span>;</div>
              <div className="pl-4"><span className="text-[#9333EA]">uint256</span> <span className="text-foreground">public</span> ROYALTY_BPS = <span className="text-[#3B82F6]">500</span>; <span className="text-muted-foreground/50">// 5%</span></div>
              <div className="pl-4"><span className="text-gold">mapping</span>(<span className="text-[#9333EA]">uint256</span> =&gt; <span className="text-[#9333EA]">string</span>) <span className="text-foreground">public</span> animationURI;</div>
              <div className="pl-4"><span className="text-gold">mapping</span>(<span className="text-[#9333EA]">address</span> =&gt; <span className="text-[#9333EA]">bool</span>) <span className="text-foreground">public</span> whitelisted;</div>
              <div>{"}"}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom ribbon */}
      <div className="absolute bottom-0 left-0 right-0 ribbon-divider" />
    </section>
  );
}
