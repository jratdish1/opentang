# HeroBase.io — Pending Code Changes (Ready to Deploy)

## 1. Intro Video Overlay (Homepage Modal — NOT /start page)

Implementation approach: One-time overlay modal on homepage. Cookie-based "seen" flag prevents repeat display.

```javascript
// IntroOverlay.jsx — React component
// On first visit: fullscreen video overlay → skip button → beta disclaimer → accept → cookie set → never shows again
// Cookie name: "herobase_intro_seen"
// Video source: [user's intro video URL]
// After skip/end: show beta disclaimer modal
// After accept: set cookie, dismiss overlay, user sees homepage
```

Key files to modify on VPS1:
- `/home/ubuntu/herobase.io/public/index.html` or main React entry
- Create new component: `IntroOverlay.jsx`
- Create new component: `BetaDisclaimer.jsx`

---

## 2. PulseChain Live Ticker — New LP Pairs

Add these tokens to the existing PLS ticker component:

| Token | Symbol | LP Pair (DEX Screener) | DEX Screener Embed |
|-------|--------|----------------------|-------------------|
| EMIT | EMIT | 0x1d05cc449b643633b013cbfb939e70cc0d37f2a3 | https://dexscreener.com/pulsechain/0x1d05cc449b643633b013cbfb939e70cc0d37f2a3?embed=1&theme=dark |
| RhinoFi | RHINO | 0x8e030e42fb8d7e1f21e827cea2fb91325f3f6b00 | https://dexscreener.com/pulsechain/0x8e030e42fb8d7e1f21e827cea2fb91325f3f6b00?embed=1&theme=dark |
| TruFarm | TruFarm | 0x086524a37deba61e08dc948ff677327de4a5150d | https://dexscreener.com/pulsechain/0x086524a37deba61e08dc948ff677327de4a5150d?embed=1&theme=dark |

API approach: Use DEX Screener API `https://api.dexscreener.com/latest/dex/pairs/pulsechain/{pairAddress}` to fetch live price data.

---

## 3. BASE Chain Live Ticker — New LP Pairs

| Token | Symbol | Contract Address | Notes |
|-------|--------|-----------------|-------|
| HERO | HERO | 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8 | User's own token on BASE |
| Wrapped ETH | WETH | 0x4200000000000000000000000000000000000006 | Standard BASE WETH |
| Brett | BRETT | Main pair: 0xba3f945812a83471d709bce9c3ca699a19fb46f7 | Popular BASE meme coin |
| Aerodrome | AERO | 0x940181a94A35A4569E4529A3CDfB74e38FD98631 | BASE DEX token |
| jesse | jesse | 0x50f88fe97f72cd3e75b9eb4f747f59bceba80d59 | BASE meme token |

API approach: Use DEX Screener API `https://api.dexscreener.com/latest/dex/pairs/base/{pairAddress}` for live prices.

---

## 4. Community Hub — TruDeFi Link

Add link: `https://double.trudefi.io/` between Media Hub title and upload button.
Use TruFarm/TruDeFi token logo as the link icon.
Logo can be pulled from DEX Screener: `https://cdn.dexscreener.com/token-images/og/pulsechain/0xca942990ef21446db490532e66992ed1ef76a82b`

---

## 5. Dashboard Chain Toggle

When switching between PLS/BASE networks, ALL stats/tokens/prices must update natively.
Implementation: State variable for active chain → all API calls use chain-specific endpoints.

```javascript
const [activeChain, setActiveChain] = useState('pulsechain'); // or 'base'
// All token lists, price feeds, stats filtered by activeChain
```

---

## 6. NFT Carousels

Wire up carousels for:
1. Military Rank NFT Collection
2. First Responder NFT Collection

Requirements:
- Pause carousel on hover
- Smooth auto-scroll
- Click to view NFT details

---

## 7. Tokenomics Section

Replace rotating circle graphic with detailed image: `IMG_7109.png`
Upload IMG_7109.png to CDN or serve from VPS static assets.

---

## 8. Media Hub Photo Upload

Upload provided photos (from /home/ubuntu/upload/) into appropriate categories on herobase.io media hub.

---

## Deployment Checklist (when SSH available)

1. SSH into VPS1 (62.146.175.67)
2. cd /home/ubuntu/herobase.io
3. git pull (if using git) or scp files
4. Apply all changes above
5. pm2 restart herobase (or equivalent)
6. Purge Cloudflare cache for herobase.io
7. Test all features in browser
