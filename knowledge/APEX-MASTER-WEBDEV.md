# APEX MASTER KNOWLEDGE — WEB DEVELOPMENT & SEO
**Compressed**: 2026-04-10 | **Domain**: HeroBase.io, VIC Foundation, SEO, Frontend
**Location**: `/opt/apex-agent/knowledge/APEX-MASTER-WEBDEV.md`

---

## 1. HEROBASE.IO

### Architecture
- Stack: TypeScript / Node.js / React / PM2
- Server: VPS1 (62.146.175.67), port 3001, nginx reverse proxy
- App directory: `/var/www/hero-dapp/` (confirm path on VPS1)

### Contract Addresses

| Token | Chain | Address |
|-------|-------|---------|
| HERO | BASE | Needs confirmation from user |
| HERO | PulseChain | Needs confirmation from user |
| VETS | PulseChain | Needs confirmation from user |

### Components Built (Need .tsx Conversion)

**IntroOverlay** — Full-screen video overlay shown once per visitor (cookie-based). Includes beta disclaimer, "I Understand" button. Needs: video URL from user.

**LiveTicker** — Horizontal scrolling ticker showing real-time LP prices from DEX Screener API. Tokens: HERO (BASE), HERO (PulseChain), VETS, EMIT, RHINO, TruFarm, WETH, BRETT, AERO, jesse.

**LanguageSelector** — Dropdown with 12 languages: EN, ES, FR, DE, JA, KO, ZH-CN, ZH-TW, AR, PT, RU, HI. Uses i18next for translation framework.

**NFTCarousel** — Auto-scrolling carousel for NFT images. Needs: image URLs from user.

### Current Build Error
AppLayout.tsx was corrupted by an awk dedup command. Fix:
```bash
cd /var/www/hero-dapp  # confirm path
git checkout HEAD -- src/components/AppLayout.tsx
# Rename .jsx components to .tsx, add type annotations
npm run build
pm2 restart herobase  # confirm PM2 process name
```

---

## 2. VIC FOUNDATION (vicfoundation.com)

### Architecture
- Stack: React + Vite + Tailwind CSS (static build)
- Server: VPS1, nginx serves static files
- DNS: Behind Cloudflare

### Pages (7 total)
1. **Home** — Hero section, mission statement, featured programs
2. **About** — Foundation history, team, mission/vision
3. **Programs** — Community programs and initiatives
4. **Donate** — Donation options and crypto wallet addresses
5. **Blog** — News and updates
6. **Contact** — Contact form and info
7. **HERO Swap** — Token swap interface
8. **404** — Custom error page

### Design System
- Palette: Navy / Olive / Gold / Crimson
- Typography: Oswald (headings) + Source Sans 3 (body)
- Style: Military-inspired, professional, accessible

### SEO Status (AIVI Analysis)
- Current score: 24/100
- Found queries: 1/5
- Competitor ranking: #2
- Citations: 9 (-6 from previous)
- Positive sentiment: 88%

### SEO Action Plan (7 Points)
1. Add structured data (JSON-LD) for Organization, FAQ, Article schemas
2. Create content targeting 4 unfound queries
3. Implement react-helmet for meta tags (Yoast no longer applies — site is React static)
4. Add sitemap.xml and robots.txt
5. Improve internal linking structure
6. Add alt text to all images
7. Create blog content targeting long-tail keywords

### Multilingual (PENDING)
- Need i18next integration for both herobase.io AND vicfoundation.com
- Minimum 10 languages: EN, ES, FR, DE, JA, KO, ZH, AR, PT, RU

---

## 3. OTHER SITES (Minimal Info)

| Site | Status | Notes |
|------|--------|-------|
| regenvalor.com | Live on VPS1 | Needs audit |
| valorpeptides.net | Live on VPS1 | Needs audit |
| at-foam.com | Live on VPS1 | Needs audit |

---

## 4. PENDING WEB TASKS

| Priority | Task | Site | Status |
|----------|------|------|--------|
| HIGH | Fix TypeScript build error | herobase.io | Blocked — need VPS1 access to restore git |
| HIGH | SEO: react-helmet + structured data | vicfoundation.com | Not started |
| HIGH | Multilingual dropdown (10+ langs) | Both sites | Not started |
| MEDIUM | Intro video overlay | herobase.io | Built, needs video URL |
| MEDIUM | NFT carousel | herobase.io | Built, needs image URLs |
| MEDIUM | LiveTicker integration | herobase.io | Built, needs deployment |
| MEDIUM | Tokenomics graphic | herobase.io | Needs IMG_7109.png location |
| LOW | Blog content for SEO | vicfoundation.com | Not started |
| LOW | Audit remaining 3 sites | regenvalor, valorpeptides, at-foam | Not started |
