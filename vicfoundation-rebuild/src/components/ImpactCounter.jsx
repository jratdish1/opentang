import { useState, useEffect, useRef } from 'react';

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function Counter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="font-heading text-4xl md:text-5xl text-gold font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const STATS = [
  { end: 2500, suffix: '+', label: 'Veterans Supported', icon: '🎖️' },
  { end: 150, suffix: 'K', prefix: '$', label: 'Donated to Causes', icon: '💰' },
  { end: 48, suffix: '', label: 'States Reached', icon: '🇺🇸' },
  { end: 12, suffix: '+', label: 'Active Programs', icon: '🤝' },
];

export default function ImpactCounter() {
  return (
    <section className="bg-navy py-16 md:py-20">
      <div className="container-vic">
        <h2 className="font-heading text-2xl md:text-3xl text-offwhite text-center mb-12 tracking-wider heading-accent heading-accent-center">
          Our Impact
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {STATS.map(({ end, suffix, prefix, label, icon }) => (
            <div key={label} className="text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <Counter end={end} prefix={prefix || ''} suffix={suffix} />
              <div className="font-heading text-sm text-offwhite/70 tracking-wider mt-2 uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
