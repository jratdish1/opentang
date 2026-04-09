/*
 * VIC FOUNDATION — ABOUT PAGE
 * Design: Navy/Olive/Gold palette, Oswald + Source Sans 3
 */
import { Link } from 'react-router-dom';
import { Heart, Shield, Target, Eye, ArrowRight } from 'lucide-react';

const TIMELINE = [
  { year: '2021', title: 'Founded', desc: 'VIC Foundation established by Marine Corps veteran with a vision to bridge crypto and charity.' },
  { year: '2022', title: '$HERO Launch', desc: '$HERO token launched on PulseChain — every trade funds community-aligned destinations.' },
  { year: '2023', title: '501(c)(3) Status', desc: 'Official nonprofit status granted. Tax-deductible donations now accepted.' },
  { year: '2024', title: 'BASE Expansion', desc: '$HERO expanded to BASE chain. HeroBase.io DEX aggregator launched.' },
  { year: '2025', title: 'Growing Impact', desc: 'Thousands of veterans supported. NFT collections launched. Global community growing.' },
  { year: '2026', title: 'Full Autonomy', desc: 'AI-powered operations, expanded programs, and deeper community integration.' },
];

const VALUES = [
  { icon: <Shield size={28} />, title: 'Service', desc: 'We serve those who have served. Period. No red tape, no bureaucracy — just direct action when it matters most.' },
  { icon: <Eye size={28} />, title: 'Transparency', desc: 'Every donation is tracked on-chain. Every dollar is accounted for. We believe accountability builds trust.' },
  { icon: <Target size={28} />, title: 'Innovation', desc: 'We leverage blockchain, DeFi, and AI to create new models of charitable giving that are more efficient and impactful.' },
  { icon: <Heart size={28} />, title: 'Community', desc: 'We are a global family of veterans, first responders, and supporters united by a common mission: honor through action.' },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-vic">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
            <span className="font-heading text-gold text-xs tracking-widest uppercase">About Us</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite tracking-wide mb-6">
            Who We <span className="text-gold">Are</span>
          </h1>
          <p className="text-offwhite/70 text-lg max-w-2xl leading-relaxed font-body">
            The VIC Foundation is a 501(c)(3) nonprofit founded by a Marine Corps veteran who
            saw a gap between those who serve and the support they deserve. We're changing that
            — one mission at a time.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-navy-dark mb-6 tracking-wider heading-accent">
                Our Story
              </h2>
              <div className="space-y-4 text-text-dark/80 leading-relaxed font-body">
                <p>
                  The VIC Foundation was born from a simple truth: the men and women who protect
                  our nation and communities often struggle to find the support they need when they
                  come home. Traditional charities are slow, bureaucratic, and opaque. We built
                  something different.
                </p>
                <p>
                  By combining the transparency of blockchain technology with the urgency of
                  direct charitable action, we created a new model. The $HERO protocol ensures
                  that every trade, every transaction, and every token contributes directly to
                  veteran and first responder support.
                </p>
                <p>
                  We're not just a charity — we're a movement. A community of veterans, first
                  responders, crypto enthusiasts, and everyday people who believe that honoring
                  service means taking action. Semper Fi.
                </p>
              </div>
            </div>

            {/* Values grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUES.map(({ icon, title, desc }) => (
                <div key={title} className="bg-navy p-6">
                  <div className="text-gold mb-3">{icon}</div>
                  <h3 className="font-heading text-offwhite text-lg tracking-wider mb-2">{title}</h3>
                  <p className="text-offwhite/60 text-sm font-body">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-navy">
        <div className="container-vic">
          <h2 className="font-heading text-2xl md:text-3xl text-offwhite text-center mb-12 tracking-wider heading-accent heading-accent-center">
            Our Journey
          </h2>
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gold/30 md:-translate-x-0.5" />

            <div className="space-y-8">
              {TIMELINE.map(({ year, title, desc }, i) => (
                <div key={year} className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-gold -translate-x-1.5 md:-translate-x-1.5 mt-1.5 z-10" />

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="bg-navy-light/50 p-6 border border-gold/10">
                      <span className="font-heading text-gold text-sm tracking-widest">{year}</span>
                      <h3 className="font-heading text-offwhite text-xl tracking-wider mt-1 mb-2">{title}</h3>
                      <p className="text-offwhite/60 text-sm font-body">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-olive">
        <div className="container-vic text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-offwhite mb-4 tracking-wider">
            Join the Mission
          </h2>
          <p className="text-offwhite/80 max-w-xl mx-auto mb-8 font-body">
            Whether you donate, volunteer, or simply spread the word — every action counts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/donate" className="btn-primary no-underline">
              <Heart size={18} /> Donate Now
            </Link>
            <Link to="/contact" className="btn-secondary no-underline">
              Get Involved <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
