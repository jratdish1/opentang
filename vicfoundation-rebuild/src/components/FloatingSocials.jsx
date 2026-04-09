import { useState } from 'react';

const SOCIALS = [
  { name: 'X (Twitter)', url: 'https://x.com/VETSINKRYPTO1', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
  { name: 'Instagram', url: 'https://www.instagram.com/vets_in_crypto/', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )},
  { name: 'YouTube', url: 'https://youtu.be/zpwKPiA1r20?si=GIKGq9AW0KsqaGcj', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )},
  { name: 'Telegram', url: 'https://t.me/vetsincrypto', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )},
  { name: 'LinkTree', url: 'https://linktr.ee/vetsincrypto', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M7.953 15.066l-.038-4.036 4.06-.001V7.391l-4.06.001.038-3.36-3.6.001-.038 3.36-4.049-.001v3.639h4.05l-.038 4.037h3.675zm8.822-11.035l-3.6.001.038 3.36-4.05-.001v3.639h4.05l-.038 4.036h3.675l.038-4.036 4.06-.001V7.391l-4.06.001-.038-3.36h-.075zm-3.675 15.969h3.675V24h-3.675z"/>
    </svg>
  )},
];

export default function FloatingSocials() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-8 h-8 bg-gold text-navy-dark flex items-center justify-center hover:bg-gold-dark transition-colors"
        aria-label="Toggle social links"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          {expanded ? (
            <path d="M15 19l-7-7 7-7" />
          ) : (
            <path d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {/* Social links */}
      <div
        className={`flex flex-col transition-all duration-300 overflow-hidden ${
          expanded ? 'max-w-16 opacity-100' : 'max-w-0 opacity-0'
        }`}
      >
        {SOCIALS.map(({ name, url, icon }) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-navy/90 text-offwhite hover:bg-gold hover:text-navy-dark flex items-center justify-center transition-all duration-200"
            title={name}
          >
            {icon}
          </a>
        ))}
      </div>
    </div>
  );
}
