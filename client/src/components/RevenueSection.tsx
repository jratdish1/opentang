import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { revenueAllocation } from "@/lib/nftData";

export default function RevenueSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Build donut segments
  let cumulativePercent = 0;
  const segments = revenueAllocation.map((item) => {
    const start = cumulativePercent;
    cumulativePercent += item.percentage;
    return { ...item, start, end: cumulativePercent };
  });

  return (
    <section id="revenue" ref={sectionRef} className="relative py-24 sm:py-32">
      <div className="relative z-10 container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-accent text-sm tracking-[0.4em] text-gold/80 uppercase">
            Transparency
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground">
            Revenue <span className="gold-shimmer">Allocation</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base font-body text-muted-foreground">
            Every dollar is accounted for. 25% goes directly to veteran and first
            responder charities — because heroes take care of their own.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {segments.map((seg, i) => {
                  const radius = 40;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDash = (seg.percentage / 100) * circumference;
                  const strokeOffset = -((seg.start / 100) * circumference);

                  return (
                    <motion.circle
                      key={seg.name}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="16"
                      strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                      strokeDashoffset={strokeOffset}
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  );
                })}
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-accent text-3xl tracking-wider text-gold">100%</span>
                <span className="text-xs font-body text-muted-foreground mt-1">Allocated</span>
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <div className="space-y-4">
            {revenueAllocation.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-[#C9A84C]/30 transition-all duration-300 group"
              >
                <div
                  className="w-4 h-4 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body font-semibold text-foreground group-hover:text-gold-light transition-colors">
                      {item.name}
                    </span>
                    <span className="font-accent text-lg tracking-wider text-gold">
                      {item.percentage}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${item.percentage}%` } : {}}
                      transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ribbon */}
      <div className="absolute bottom-0 left-0 right-0 ribbon-divider" />
    </section>
  );
}
