# HeroBase.io — Code Package Deployment Guide

## Components Ready for Integration

### 1. IntroOverlay.jsx
**Purpose**: One-time fullscreen intro video + beta disclaimer overlay on homepage.

**Integration**:
```jsx
// In your main App or Homepage component:
import IntroOverlay from './components/IntroOverlay';

function App() {
  return (
    <>
      <IntroOverlay videoSrc="/assets/intro-video.mp4" />
      {/* rest of your app */}
    </>
  );
}
```

**Cookie**: Sets `herobase_intro_seen` cookie for 365 days. User only sees overlay once.

---

### 2. LiveTicker.jsx
**Purpose**: Real-time price ticker for PulseChain and BASE tokens using DEX Screener API.

**Integration**:
```jsx
import LiveTicker from './components/LiveTicker';

// In your header or dashboard:
<LiveTicker activeChain={activeChain} />
```

**Tokens included**:
- PulseChain: EMIT, RHINO, TruFarm
- BASE: HERO, BRETT, AERO, jesse

**API**: Uses `https://api.dexscreener.com/latest/dex/pairs/` and `/tokens/` endpoints. Auto-refreshes every 30 seconds.

---

### 3. LanguageSelector.jsx
**Purpose**: Multilingual language dropdown (12 languages). Stores preference in localStorage.

**Integration**:
```jsx
import LanguageSelector from './components/LanguageSelector';

// In your navbar:
<LanguageSelector onChange={(langCode) => i18n.changeLanguage(langCode)} />
```

**Languages**: EN, ES, FR, DE, JA, KO, ZH, AR, PT, RU, HI, TL

**Note**: This component handles the UI only. For actual translation, integrate with `react-i18next`:
```bash
npm install react-i18next i18next
```

---

### 4. NFTCarousel.jsx
**Purpose**: Auto-scrolling NFT carousel with pause-on-hover. For Military Rank and First Responder collections.

**Integration**:
```jsx
import NFTCarousel from './components/NFTCarousel';

const militaryNFTs = [
  { id: 1, name: 'Private', rank: 'E-1', image: '/nfts/private.png' },
  { id: 2, name: 'Corporal', rank: 'E-4', image: '/nfts/corporal.png' },
  // ...
];

<NFTCarousel title="Military Rank Collection" nfts={militaryNFTs} />
<NFTCarousel title="First Responder Collection" nfts={firstResponderNFTs} />
```

---

## Deployment Steps (when SSH available)

```bash
# 1. SSH into VPS1
ssh root@62.146.175.67

# 2. Navigate to herobase.io project
cd /home/ubuntu/herobase.io  # or wherever the project lives

# 3. Copy components
scp IntroOverlay.jsx LiveTicker.jsx LanguageSelector.jsx NFTCarousel.jsx \
    root@62.146.175.67:/home/ubuntu/herobase.io/src/components/

# 4. Install react-i18next for multilingual support
npm install react-i18next i18next

# 5. Restart the app
pm2 restart herobase  # or whatever process manager is used

# 6. Purge Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer {CF_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Still TODO (requires VPS access)
- Upload IMG_7109.png for tokenomics section
- Add TruDeFi link in Community Hub
- Upload photos to Media Hub
- Wire chain toggle to update all stats/tokens
- Test intro video overlay with actual video file
