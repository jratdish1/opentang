/*
 * VIC FOUNDATION — HOME PAGE
 * Design: "Honor Through Action" — Navy/Olive/Gold/Crimson palette
 * Typography: Oswald headlines, Source Sans 3 body
 * Layout: Full-width hero → asymmetric mission → impact counters → programs grid → testimonials → CTA
 */
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, BookOpen, ArrowRight, ChevronRight } from 'lucide-react';
import ImpactCounter from '../components/ImpactCounter';

const PROGRAMS = [
  {
    icon: <Shield size={32} />,
    title: 'Emergency Relief',
    desc: 'Immediate financial assistance for veterans and first responders facing crisis — housing, medical bills, and emergency needs.',
    link: '/programs',
  },
  {
    icon: <Users size={32} />,
    title: 'Community Building',
    desc: 'Connecting service members through events, mentorship programs, and a global network of support.',
    link: '/programs',
  },
  {
    icon: <BookOpen size={32} />,
    title: 'Education & Training',
    desc: 'Scholarships, career transition support, and blockchain literacy programs for veterans entering Web3.',
    link: '/programs',
  },
  {
    icon: <Heart size={32} />,
    title: 'Crypto for Good',
    desc: 'Leveraging $HERO token and DeFi innovation to create transparent, on-chain charitable giving with real impact.',
    link: '/donate',
  },
];

const TESTIMONIALS = [
  {
    quote: "The VIC Foundation helped me when I had nowhere else to turn. They didn't just write a check — they connected me with a community that understood.",
    name: 'SSgt. Marcus R.',
    branch: 'U.S. Marine Corps',
  },
  {
    quote: "After 20 years of service, transitioning to civilian life was the hardest mission I ever faced. VIC Foundation made it possible.",
    name: 'SFC. Diana L.',
    branch: 'U.S. Army',
  },
  {
    quote: "As a firefighter, I never thought I'd need help. But when my family hit hard times, VIC Foundation was there within 48 hours.",
    name: 'Lt. James K.',
    branch: 'FDNY',
  },
];

export default function Home() {
  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background — dark navy with diagonal olive accent */}
        <div className="absolute inset-0 bg-navy-dark" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 40px,
                oklch(0.45 0.08 130 / 15%) 40px,
                oklch(0.45 0.08 130 / 15%) 42px
              )
            `,
          }}
        />
        {/* Diagonal accent */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full hidden lg:block"
          style={{
            background: 'linear-gradient(135deg, transparent 30%, oklch(0.45 0.08 130 / 8%) 30%, oklch(0.45 0.08 130 / 8%) 32%, transparent 32%)',
          }}
        />

        <div className="container-vic relative z-10 pt-28 pb-16 md:pt-32 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content — 7 cols */}
            <div className="lg:col-span-7">
              <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
                <span className="font-heading text-gold text-xs tracking-widest uppercase">
                  501(c)(3) Nonprofit Organization
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-offwhite leading-none mb-6 tracking-wide">
                Honor Through
                <span className="block text-gold mt-2">Action</span>
              </h1>

              <p className="text-offwhite/70 text-lg md:text-xl max-w-xl mb-8 leading-relaxed font-body">
                Empowering veterans, first responders, and their families through community,
                crypto innovation, and direct action. Every dollar. Every token. Every mission.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/donate" className="btn-crimson no-underline text-base">
                  <Heart size={18} />
                  Donate Now
                </Link>
                <Link to="/about" className="btn-secondary no-underline text-base">
                  Our Mission
                  <ArrowRight size={18} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-offwhite/10">
                {['Tax Deductible', 'On-Chain Transparent', '100% Volunteer Led'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gold" />
                    <span className="font-heading text-offwhite/50 text-xs tracking-wider uppercase">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side — 5 cols, feature card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-gold/20" />
                <div className="bg-navy p-8 relative">
                  <div className="font-heading text-gold text-xs tracking-widest mb-4 uppercase">
                    Semper Fi
                  </div>
                  <blockquote className="text-offwhite/80 text-lg italic leading-relaxed mb-6 font-body">
                    "The willingness of America's veterans to sacrifice for our country has earned
                    them our lasting gratitude."
                  </blockquote>
                  <div className="text-offwhite/50 text-sm">— Jeff Miller</div>

                  <div className="mt-8 pt-6 border-t border-offwhite/10">
                    <div className="font-heading text-gold text-xs tracking-widest mb-3 uppercase">
                      Quick Actions
                    </div>
                    <div className="space-y-2">
                      <Link to="/donate" className="flex items-center justify-between p-3 bg-navy-light/50 hover:bg-gold/10 transition-colors no-underline group">
                        <span className="text-offwhite/80 text-sm font-body">Make a Donation</span>
                        <ChevronRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/hero-swap" className="flex items-center justify-between p-3 bg-navy-light/50 hover:bg-gold/10 transition-colors no-underline group">
                        <span className="text-offwhite/80 text-sm font-body">Buy $HERO Token</span>
                        <ChevronRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/programs" className="flex items-center justify-between p-3 bg-navy-light/50 hover:bg-gold/10 transition-colors no-underline group">
                        <span className="text-offwhite/80 text-sm font-body">View Programs</span>
                        <ChevronRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MISSION SECTION ═══ */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-navy-dark mb-6 tracking-wider heading-accent">
                Our Mission
              </h2>
              <p className="text-text-dark/80 text-lg leading-relaxed mb-4 font-body">
                The VIC Foundation is a 501(c)(3) nonprofit organization dedicated to serving
                those who have served us. We bridge the gap between traditional charitable giving
                and blockchain innovation to create transparent, accountable, and impactful support
                for veterans, first responders, and their families.
              </p>
              <p className="text-text-muted leading-relaxed mb-6 font-body">
                Through the $HERO protocol, every transaction directly funds community initiatives.
                On-chain donations mean full transparency — you can see exactly where every dollar
                and every token goes. No middlemen. No overhead. Just direct action.
              </p>
              <Link to="/about" className="btn-primary no-underline">
                Learn More
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Mission values grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Transparency', desc: 'On-chain tracking for every donation', color: 'bg-navy' },
                { title: 'Community', desc: 'Global network of veterans & supporters', color: 'bg-olive' },
                { title: 'Innovation', desc: 'DeFi-powered charitable giving', color: 'bg-olive-dark' },
                { title: 'Action', desc: 'Direct impact, zero bureaucracy', color: 'bg-navy-light' },
              ].map(({ title, desc, color }) => (
                <div key={title} className={`${color} p-6 text-offwhite`}>
                  <h3 className="font-heading text-gold text-lg tracking-wider mb-2">{title}</h3>
                  <p className="text-offwhite/70 text-sm font-body">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ IMPACT COUNTERS ═══ */}
      <ImpactCounter />

      {/* ═══ PROGRAMS SECTION ═══ */}
      <section className="section-padding bg-warm-gray">
        <div className="container-vic">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-navy-dark mb-4 tracking-wider heading-accent heading-accent-center">
              Our Programs
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto font-body">
              From emergency relief to blockchain education, our programs are designed to meet
              veterans and first responders where they are.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROGRAMS.map(({ icon, title, desc, link }) => (
              <Link
                key={title}
                to={link}
                className="group bg-offwhite p-8 border-l-4 border-gold hover:border-crimson transition-all duration-300 hover:shadow-lg no-underline"
              >
                <div className="text-olive group-hover:text-crimson transition-colors mb-4">
                  {icon}
                </div>
                <h3 className="font-heading text-navy-dark text-xl tracking-wider mb-3 group-hover:text-crimson transition-colors">
                  {title}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed font-body">{desc}</p>
                <div className="flex items-center gap-2 mt-4 text-gold font-heading text-sm tracking-wider uppercase group-hover:text-crimson transition-colors">
                  Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section-padding bg-navy">
        <div className="container-vic">
          <h2 className="font-heading text-2xl md:text-3xl text-offwhite text-center mb-12 tracking-wider heading-accent heading-accent-center">
            Stories of Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ quote, name, branch }) => (
              <div key={name} className="bg-navy-light/50 p-8 border-t-2 border-gold">
                <div className="text-gold text-3xl mb-4 font-heading">"</div>
                <p className="text-offwhite/80 leading-relaxed mb-6 italic font-body">{quote}</p>
                <div>
                  <div className="font-heading text-gold text-sm tracking-wider">{name}</div>
                  <div className="text-offwhite/50 text-xs font-body">{branch}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ $HERO TOKEN CTA ═══ */}
      <section className="section-padding bg-olive">
        <div className="container-vic text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-offwhite mb-4 tracking-wider">
            Every Trade Funds the Mission
          </h2>
          <p className="text-offwhite/80 max-w-2xl mx-auto mb-8 text-lg font-body">
            $HERO is a community-first token on PulseChain and BASE. Every transaction fuels
            charitable impact through the VIC Foundation. Buy, hold, and make a difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/hero-swap" className="btn-primary no-underline">
              Buy $HERO
            </Link>
            <a
              href="https://herobase.io"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary no-underline"
            >
              Visit HeroBase.io
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
