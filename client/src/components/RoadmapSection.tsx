import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Rocket, Globe, Layers, Check } from "lucide-react";
import { roadmapPhases } from "@/lib/nftData";

const ROADMAP_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/n6wZKBCrhC57u7dtf5EHg8/roadmap_bg-4ujPSJG5qDwVxsGYwrp4ek.webp";

const phaseIcons = [Rocket, Globe, Layers];

export default function RoadmapSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="roadmap" ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={ROADMAP_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.02_260/0.92)] via-[oklch(0.12_0.02_260/0.88)] to-[oklch(0.12_0.02_260/0.95)]" />
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
            The Journey
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            Deployment <span className="gold-shimmer">Roadmap</span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C9A84C] via-[#C9A84C]/50 to-[#C9A84C]/20" />

          {roadmapPhases.map((phase, i) => {
            const Icon = phaseIcons[i];
            const isLeft = i % 2 === 0;

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.25 }}
                className={`relative flex items-start gap-6 mb-16 last:mb-0 ${
                  isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border-2 border-[#C9A84C] flex items-center justify-center z-10 shadow-lg">
                  <Icon className="w-5 h-5 text-gold" />
                </div>

                {/* Content card */}
                <div
                  className={`ml-20 lg:ml-0 lg:w-[calc(50%-3rem)] ${
                    isLeft ? "lg:pr-0" : "lg:pl-0"
                  }`}
                >
                  <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 hover:border-[#C9A84C]/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-accent text-xs tracking-[0.3em] text-gold uppercase">
                        Phase {phase.phase}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-accent tracking-wider bg-[#C9A84C]/10 text-gold border border-[#C9A84C]/30">
                        UPCOMING
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                      {phase.title}
                    </h3>
                    <ul className="space-y-3">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span className="text-sm font-body text-muted-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
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
