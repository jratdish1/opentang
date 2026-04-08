import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Users, Vote, Coins, TrendingUp, ShoppingBag, Ticket,
  Sparkles, Heart, ArrowLeftRight, Star, Crown, Shield
} from "lucide-react";
import { utilityTiers } from "@/lib/nftData";

const MEDAL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/n6wZKBCrhC57u7dtf5EHg8/gold_medal_texture-SczAzDdC3VBHzwzAcmxymw.webp";

const iconMap: Record<string, React.ElementType> = {
  Users, Vote, Coins, TrendingUp, ShoppingBag, Ticket,
  Sparkles, Heart, ArrowLeftRight,
};

const tierIcons = [Shield, Star, Crown];
const tierBorderStyles = [
  "border-[#6B7280]/40 hover:border-[#6B7280]",
  "border-[#C9A84C]/40 hover:border-[#C9A84C]",
  "border-[#8B0000]/40 hover:border-[#8B0000]",
];
const tierGlowStyles = [
  "hover:shadow-[0_0_30px_rgba(107,114,128,0.15)]",
  "hover:shadow-[0_0_30px_rgba(201,168,76,0.2)]",
  "hover:shadow-[0_0_30px_rgba(139,0,0,0.2)]",
];

export default function UtilitySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="utility" ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Subtle medal texture in corner */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.04] pointer-events-none">
        <img src={MEDAL_BG} alt="" className="w-full h-full object-cover" />
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
            ERC-721 Utility
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            Holder <span className="gold-shimmer">Benefits</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base font-body text-muted-foreground">
            Three ascending tiers of utility — from community access to exclusive
            custom animations and charity board seats.
          </p>
        </motion.div>

        {/* Tier Cards — ascending platforms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
          {utilityTiers.map((tier, i) => {
            const TierIcon = tierIcons[i];
            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                className={`relative ${i === 0 ? "lg:mb-0" : i === 1 ? "lg:-mb-4" : "lg:-mb-8"}`}
              >
                <div
                  className={`relative rounded-lg border-2 ${tierBorderStyles[i]} ${tierGlowStyles[i]} bg-card/80 backdrop-blur-sm transition-all duration-500 overflow-hidden`}
                >
                  {/* Tier header */}
                  <div
                    className="relative px-6 py-5 border-b border-border/50"
                    style={{
                      background: `linear-gradient(135deg, ${tier.color}15, transparent)`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${tier.color}20` }}
                      >
                        <TierIcon className="w-5 h-5" style={{ color: tier.color }} />
                      </div>
                      <div>
                        <div className="font-accent text-xs tracking-[0.3em] uppercase" style={{ color: tier.color }}>
                          Tier {tier.tier}
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                          {tier.name}
                        </h3>
                      </div>
                    </div>
                    <span className="mt-2 inline-block px-3 py-0.5 rounded-full text-[10px] font-accent tracking-wider bg-muted text-muted-foreground">
                      {tier.subtitle.toUpperCase()}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="p-6 space-y-5">
                    {tier.features.map((feature) => {
                      const FeatureIcon = iconMap[feature.icon] || Shield;
                      return (
                        <div key={feature.title} className="flex gap-4">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: `${tier.color}15` }}
                          >
                            <FeatureIcon className="w-4 h-4" style={{ color: tier.color }} />
                          </div>
                          <div>
                            <h4 className="font-body text-sm font-semibold text-foreground">
                              {feature.title}
                            </h4>
                            <p className="mt-1 text-xs font-body text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom ribbon */}
      <div className="absolute bottom-0 left-0 right-0 ribbon-divider" />
    </section>
  );
}
