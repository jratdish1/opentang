/*
 * VIC FOUNDATION — DONATE PAGE
 * Design: Navy/Olive/Gold palette, Oswald + Source Sans 3
 * Features: Fiat donations (future Stripe/PayPal), Crypto donations (NOWPayments widget placeholder)
 */
import { useState } from 'react';
import { Heart, CreditCard, Wallet, Shield, Eye, ArrowRight } from 'lucide-react';

const AMOUNTS = [25, 50, 100, 250, 500, 1000];

const CRYPTO_WALLETS = [
  { chain: 'PulseChain', token: '$HERO', address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8', note: 'Send HERO, PLS, or any PRC-20 token' },
  { chain: 'BASE', token: '$HERO', address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8', note: 'Send HERO, ETH, or any ERC-20 token on BASE' },
  { chain: 'Ethereum', token: 'ETH/USDC', address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8', note: 'Send ETH, USDC, or any ERC-20 token' },
];

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('fiat');
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopy = (address, idx) => {
    navigator.clipboard.writeText(address);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-dark pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="container-vic">
          <div className="inline-block px-4 py-1.5 bg-gold/10 border border-gold/30 mb-6">
            <span className="font-heading text-gold text-xs tracking-widest uppercase">Support the Mission</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite tracking-wide mb-6">
            Make a <span className="text-gold">Difference</span>
          </h1>
          <p className="text-offwhite/70 text-lg max-w-2xl leading-relaxed font-body">
            Your donation directly supports veterans and first responders. 100% tax-deductible.
            100% transparent. Choose fiat or crypto — every dollar counts.
          </p>
        </div>
      </section>

      {/* Donation Section */}
      <section className="section-padding bg-offwhite">
        <div className="container-vic">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main donation form — 2 cols */}
            <div className="lg:col-span-2">
              {/* Toggle */}
              <div className="flex mb-8 bg-warm-gray p-1">
                <button
                  onClick={() => setDonationType('fiat')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-heading text-sm tracking-wider uppercase transition-all ${
                    donationType === 'fiat'
                      ? 'bg-navy text-offwhite'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  <CreditCard size={18} /> Fiat Donation
                </button>
                <button
                  onClick={() => setDonationType('crypto')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-heading text-sm tracking-wider uppercase transition-all ${
                    donationType === 'crypto'
                      ? 'bg-navy text-offwhite'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  <Wallet size={18} /> Crypto Donation
                </button>
              </div>

              {donationType === 'fiat' ? (
                <div className="bg-white p-8 shadow-sm">
                  <h3 className="font-heading text-navy-dark text-xl tracking-wider mb-6">
                    Select Amount
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                        className={`py-3 font-heading text-lg tracking-wider transition-all ${
                          selectedAmount === amt && !customAmount
                            ? 'bg-gold text-navy-dark'
                            : 'bg-warm-gray text-text-dark hover:bg-gold/20'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                      className="w-full px-4 py-3 border border-warm-gray text-text-dark font-body text-lg focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 border border-warm-gray text-text-dark font-body focus:outline-none focus:border-gold transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 border border-warm-gray text-text-dark font-body focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <button
                    className="btn-crimson w-full justify-center text-lg py-4"
                    onClick={() => alert('Payment integration coming soon! For now, please use crypto donation or contact us directly.')}
                  >
                    <Heart size={20} />
                    Donate ${customAmount || selectedAmount}
                  </button>
                  <p className="text-text-muted text-xs mt-3 text-center font-body">
                    Stripe/PayPal integration coming soon. Contact info@vicfoundation.com for direct fiat donations.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-8 shadow-sm">
                  <h3 className="font-heading text-navy-dark text-xl tracking-wider mb-2">
                    Crypto Wallet Addresses
                  </h3>
                  <p className="text-text-muted text-sm mb-6 font-body">
                    Send crypto directly to our verified wallet addresses. All donations are tracked on-chain for full transparency.
                  </p>
                  <div className="space-y-4">
                    {CRYPTO_WALLETS.map(({ chain, token, address, note }, idx) => (
                      <div key={chain} className="border border-warm-gray p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-heading text-navy-dark text-sm tracking-wider">{chain}</span>
                            <span className="text-gold text-sm ml-2 font-body">({token})</span>
                          </div>
                          <button
                            onClick={() => handleCopy(address, idx)}
                            className="text-xs font-heading tracking-wider text-olive hover:text-gold transition-colors uppercase"
                          >
                            {copiedIdx === idx ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <code className="block text-xs text-text-muted break-all bg-warm-gray p-2 font-mono">
                          {address}
                        </code>
                        <p className="text-text-muted text-xs mt-2 font-body">{note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gold/10 border border-gold/30">
                    <p className="text-sm text-text-dark font-body">
                      <strong>NOWPayments Widget:</strong> Coming soon — accept 100+ cryptocurrencies with automatic conversion.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-navy p-6">
                <h4 className="font-heading text-gold text-sm tracking-widest mb-4 uppercase">Why Donate?</h4>
                <ul className="space-y-3">
                  {[
                    { icon: <Shield size={16} />, text: '100% goes to programs — zero overhead' },
                    { icon: <Eye size={16} />, text: 'On-chain transparency for every donation' },
                    { icon: <Heart size={16} />, text: 'Tax-deductible 501(c)(3) organization' },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <span className="text-gold mt-0.5">{icon}</span>
                      <span className="text-offwhite/70 text-sm font-body">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-olive p-6">
                <h4 className="font-heading text-offwhite text-sm tracking-widest mb-3 uppercase">
                  Other Ways to Help
                </h4>
                <div className="space-y-2 text-offwhite/80 text-sm font-body">
                  <p>Buy & hold $HERO — every trade funds the mission</p>
                  <p>Share our story on social media</p>
                  <p>Volunteer your time and skills</p>
                  <p>Corporate sponsorship opportunities</p>
                </div>
                <a
                  href="https://herobase.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-4 text-xs py-2 px-4 no-underline"
                >
                  Buy $HERO <ArrowRight size={14} />
                </a>
              </div>

              <div className="bg-warm-gray p-6">
                <h4 className="font-heading text-navy-dark text-sm tracking-widest mb-3 uppercase">
                  Tax Information
                </h4>
                <p className="text-text-muted text-sm font-body">
                  VIC Foundation is a registered 501(c)(3) nonprofit organization. All donations
                  are tax-deductible to the extent allowed by law. You will receive a receipt
                  for your records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
