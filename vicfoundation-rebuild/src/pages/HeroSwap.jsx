/*
 * VIC FOUNDATION — HERO SWAP PAGE
 * Design: Navy/Olive/Gold palette, Oswald + Source Sans 3
 * Features: Embedded DEX swap widget, token info, chain toggle
 */
import { useState } from 'react';
import { ArrowRight, ExternalLink, Shield, TrendingUp, Users } from 'lucide-react';

const CHAINS = [
  {
    id: 'pulsechain',
    name: 'PulseChain',
    token: '$HERO',
    contract: '0x...PulseChain',
    dexUrl: 'https://herobase.io/swap',
    explorerUrl: 'https://scan.pulsechain.com',
    color: 'bg-purple-600',
  },
  {
    id: 'base',
    name: 'BASE',
    token: '$HERO',
    contract: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    dexUrl: 'https://herobase.io/swap',
    explorerUrl: 'https://basescan.org/token/0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    color: 'bg-blue-600',
  },
];

const TOKEN_FEATURES = [
  { icon: <Shield size={24} />, title: 'Community-First', desc: 'Every trade funds community-aligned destinations through the VIC Foundation.' },
  { icon: <TrendingUp size={24} />, title: 'Hyper-Deflationary', desc: 'Buy & burn mechanism reduces supply over time, rewarding long-term holders.' },
  { icon: <Users size={24} />, title: 'Transparent', desc: 'On-chain donations with full tracking. See exactly where every token goes.' },
];

export default function HeroSwap() {
  const [activeChain, setActiveChain] = useState('base');
  const chain = CHAINS.find((c) => c.id === activeChain);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-vic">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
            <span className="font-heading text-gold text-xs tracking-widest uppercase">$HERO Token</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite tracking-wide mb-6">
            Buy <span className="text-gold">$HERO</span>
          </h1>
          <p className="text-offwhite/70 text-lg max-w-2xl leading-relaxed font-body">
            Every $HERO token purchase directly funds veteran and first responder support
            through the VIC Foundation. Buy, hold, and make a difference.
          </p>
        </div>
      </section>

      {/* Chain Toggle + Swap */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main area — 2 cols */}
            <div className="lg:col-span-2">
              {/* Chain toggle */}
              <div className="flex mb-6 bg-warm-gray p-1">
                {CHAINS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChain(c.id)}
                    className={`flex-1 py-3 font-heading text-sm tracking-wider uppercase transition-all ${
                      activeChain === c.id
                        ? 'bg-navy text-offwhite'
                        : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Swap widget area */}
              <div className="bg-white p-8 shadow-sm">
                <h3 className="font-heading text-navy-dark text-xl tracking-wider mb-4">
                  Swap on {chain.name}
                </h3>

                <div className="bg-navy p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gold/20 flex items-center justify-center mb-4">
                    <span className="font-heading text-gold text-2xl">H</span>
                  </div>
                  <h4 className="font-heading text-offwhite text-lg tracking-wider mb-2">
                    $HERO Swap Widget
                  </h4>
                  <p className="text-offwhite/60 text-sm mb-6 max-w-md font-body">
                    The embedded swap widget will be available here. For now, swap directly on HeroBase.io.
                  </p>
                  <a
                    href={chain.dexUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary no-underline"
                  >
                    Swap on HeroBase.io <ExternalLink size={16} />
                  </a>
                </div>

                {/* Contract info */}
                <div className="mt-6 p-4 bg-warm-gray">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-heading text-navy-dark text-xs tracking-widest uppercase">Contract ({chain.name})</span>
                      <code className="block text-xs text-text-muted mt-1 break-all font-mono">{chain.contract}</code>
                    </div>
                    <a
                      href={chain.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-olive hover:text-gold text-xs font-heading tracking-wider uppercase no-underline flex items-center gap-1"
                    >
                      View on Explorer <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-navy p-6">
                <h4 className="font-heading text-gold text-sm tracking-widest mb-4 uppercase">Why $HERO?</h4>
                <div className="space-y-5">
                  {TOKEN_FEATURES.map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <span className="text-gold mt-0.5">{icon}</span>
                      <div>
                        <h5 className="font-heading text-offwhite text-sm tracking-wider mb-1">{title}</h5>
                        <p className="text-offwhite/60 text-xs font-body">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-olive p-6">
                <h4 className="font-heading text-offwhite text-sm tracking-widest mb-3 uppercase">
                  How It Works
                </h4>
                <ol className="space-y-3 list-none">
                  {[
                    'Connect your wallet (MetaMask, Rabby, etc.)',
                    'Select PulseChain or BASE network',
                    'Swap ETH/PLS for $HERO',
                    'Hold & earn — every trade funds the mission',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-heading text-gold text-sm">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-offwhite/80 text-sm font-body">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-warm-gray p-6">
                <h4 className="font-heading text-navy-dark text-sm tracking-widest mb-3 uppercase">
                  Resources
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'HeroBase.io', url: 'https://herobase.io' },
                    { label: 'Token Docs', url: 'https://docs.vicfoundation.com/token/overview' },
                    { label: 'DEX Screener', url: 'https://dexscreener.com/base/0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8' },
                  ].map(({ label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 hover:bg-navy/5 transition-colors no-underline group"
                    >
                      <span className="text-text-dark text-sm font-body">{label}</span>
                      <ArrowRight size={14} className="text-gold group-hover:translate-x-1 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
