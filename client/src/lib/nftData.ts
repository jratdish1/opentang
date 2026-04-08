// $HERO Animated NFT Collection — Data Constants
// Design: "Heroes Hall of Honor" — Cinematic Blockbuster Showcase
// Navy blue + burnished gold palette, Playfair Display + Bebas Neue typography

export const CDN_BASE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663472861536/n6wZKBCrhC57u7dtf5EHg8";

export interface AnimatedNFT {
  id: number;
  name: string;
  codename: string;
  country: string;
  countryFlag: string;
  category: "Fire" | "Medical" | "Military" | "Rescue";
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare" | "Legendary";
  chain: "PulseChain" | "BASE" | "Shared";
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
}

export interface KeyframeNFT {
  id: number;
  name: string;
  country: string;
  countryFlag: string;
  category: string;
  thumbnailUrl: string;
  status: "Ready for Animation";
}

export const animatedNFTs: AnimatedNFT[] = [
  {
    id: 1,
    name: "UK Firefighter",
    codename: "London Blaze",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
    category: "Fire",
    rarity: "Rare",
    chain: "PulseChain",
    videoUrl: `${CDN_BASE}/uk_firefighter_with_music_63551385.mp4`,
    thumbnailUrl: `${CDN_BASE}/uk_firefighter_first_59e6b5df.png`,
    description: "British firefighter battling a London blaze with Big Ben in the background. Yellow Cromwell helmet, navy turnout gear, halligan bar at the ready."
  },
  {
    id: 2,
    name: "South Korean Firefighter",
    codename: "Seoul Inferno",
    country: "South Korea",
    countryFlag: "🇰🇷",
    category: "Fire",
    rarity: "Rare",
    chain: "BASE",
    videoUrl: `${CDN_BASE}/south_korea_firefighter_with_music_8040edfb.mp4`,
    thumbnailUrl: `${CDN_BASE}/south_korea_firefighter_first_eeaf7bac.png`,
    description: "South Korean firefighter battling a Seoul high-rise fire. Orange Korean helmet, neon-lit cityscape, Lotte World Tower in the smoke."
  },
  {
    id: 3,
    name: "US Marine",
    codename: "Desert Storm",
    country: "United States",
    countryFlag: "🇺🇸",
    category: "Military",
    rarity: "Ultra Rare",
    chain: "Shared",
    videoUrl: `${CDN_BASE}/us_marine_with_music_212595d5.mp4`,
    thumbnailUrl: `${CDN_BASE}/us_marine_combat_first_bb2a0e98.png`,
    description: "US Marine in MARPAT woodland camo, M4 carbine at the ready. Desert combat zone with the Eagle Globe & Anchor blazing in the sunset sky."
  },
  {
    id: 4,
    name: "Cruz Roja Paramedic",
    codename: "Terremoto",
    country: "Mexico",
    countryFlag: "🇲🇽",
    category: "Medical",
    rarity: "Rare",
    chain: "PulseChain",
    videoUrl: `${CDN_BASE}/mexico_cruz_roja_with_music_dddf75f1.mp4`,
    thumbnailUrl: `${CDN_BASE}/mexico_cruz_roja_first_18b422b0.png`,
    description: "Mexican Cruz Roja paramedic at an earthquake rescue scene. Red Cross uniform, spine board, Angel of Independence in the golden sunset distance."
  }
];

export const keyframeNFTs: KeyframeNFT[] = [
  {
    id: 5,
    name: "Japanese Paramedic",
    country: "Japan",
    countryFlag: "🇯🇵",
    category: "Medical",
    thumbnailUrl: `${CDN_BASE}/japan_paramedic_first_4125bbe1.png`,
    status: "Ready for Animation"
  },
  {
    id: 6,
    name: "Nigerian Military Medic",
    country: "Nigeria",
    countryFlag: "🇳🇬",
    category: "Military Medical",
    thumbnailUrl: `${CDN_BASE}/nigeria_military_medic_first_2a3aef70.png`,
    status: "Ready for Animation"
  },
  {
    id: 7,
    name: "Brazilian SAMU Paramedic",
    country: "Brazil",
    countryFlag: "🇧🇷",
    category: "Medical",
    thumbnailUrl: `${CDN_BASE}/brazil_samu_first_1c7e6dd7.png`,
    status: "Ready for Animation"
  },
  {
    id: 8,
    name: "German THW Rescue Tech",
    country: "Germany",
    countryFlag: "🇩🇪",
    category: "Rescue",
    thumbnailUrl: `${CDN_BASE}/germany_thw_rescue_first_5b58b205.png`,
    status: "Ready for Animation"
  },
  {
    id: 9,
    name: "Indian Female Military Doctor",
    country: "India",
    countryFlag: "🇮🇳",
    category: "Military Medical",
    thumbnailUrl: `${CDN_BASE}/india_female_doctor_first_85ba4079.png`,
    status: "Ready for Animation"
  },
  {
    id: 10,
    name: "Australian Paramedic",
    country: "Australia",
    countryFlag: "🇦🇺",
    category: "Medical",
    thumbnailUrl: `${CDN_BASE}/australia_paramedic_first_56f572ef.png`,
    status: "Ready for Animation"
  }
];

export const utilityTiers = [
  {
    tier: 1,
    name: "Core Utility",
    subtitle: "All Holders",
    color: "#6B7280",
    features: [
      {
        title: "Community Access",
        description: "Exclusive $HERO Discord & Telegram channels with verified holder roles",
        icon: "Users"
      },
      {
        title: "Governance Voting",
        description: "Participate in DAO proposals for collection direction, charity donations, and community fund allocation",
        icon: "Vote"
      },
      {
        title: "Staking Rewards",
        description: "Stake animated NFTs to earn $HERO token rewards — rarer NFTs earn higher APY",
        icon: "Coins"
      }
    ]
  },
  {
    tier: 2,
    name: "Enhanced Utility",
    subtitle: "Rare+ Holders",
    color: "#C9A84C",
    features: [
      {
        title: "Revenue Sharing",
        description: "Percentage of secondary market royalties distributed back to Rare, Ultra Rare, and Legendary holders",
        icon: "TrendingUp"
      },
      {
        title: "Merch Discounts",
        description: "Exclusive physical merchandise — challenge coins, patches, apparel at discounted prices",
        icon: "ShoppingBag"
      },
      {
        title: "IRL Event Access",
        description: "VIP entry to veteran charity events, military appreciation gatherings, and $HERO meetups",
        icon: "Ticket"
      }
    ]
  },
  {
    tier: 3,
    name: "Premium Utility",
    subtitle: "Legendary Holders",
    color: "#8B0000",
    features: [
      {
        title: "1-of-1 Custom Animation",
        description: "Request a custom animated NFT of your own military branch, unit, or first responder role",
        icon: "Sparkles"
      },
      {
        title: "Charity Board Seat",
        description: "Vote on which veteran and first responder charities receive quarterly donations from the treasury",
        icon: "Heart"
      },
      {
        title: "Cross-Chain Bridge Priority",
        description: "Priority access to bridge NFTs between PulseChain and BASE networks",
        icon: "ArrowLeftRight"
      }
    ]
  }
];

export const revenueAllocation = [
  { name: "Veteran & First Responder Charities", percentage: 25, color: "#C9A84C" },
  { name: "$HERO Token Buyback & Burn", percentage: 20, color: "#8B0000" },
  { name: "Holder Revenue Sharing", percentage: 20, color: "#1B3A5C" },
  { name: "Development & Operations", percentage: 20, color: "#4A6FA5" },
  { name: "Community Treasury (DAO)", percentage: 15, color: "#6B7280" }
];

export const roadmapPhases = [
  {
    phase: 1,
    title: "PulseChain Launch",
    status: "upcoming" as const,
    items: [
      "555 animated NFTs deployed on PulseChain",
      "Mint price in PLS with $HERO token discount",
      "Whitelist for $HERO and $VETS token holders",
      "Staking contract deployment"
    ]
  },
  {
    phase: 2,
    title: "BASE Launch",
    status: "upcoming" as const,
    items: [
      "Mirrored 555 collection on BASE network",
      "Mint price in ETH with $HERO discount",
      "Cross-chain bridge activation",
      "OpenSea & marketplace listings"
    ]
  },
  {
    phase: 3,
    title: "Expansion",
    status: "upcoming" as const,
    items: [
      "New characters added quarterly via community vote",
      "International hero expansion — more countries",
      "Veteran organization collaboration NFTs",
      "Physical merch store launch"
    ]
  }
];

export const collectionStats = {
  totalSupply: 555,
  chains: ["PulseChain", "BASE"],
  artStyle: "Cartoon / Comic Book",
  mediaFormat: "MP4 Video (H.264 + AAC)",
  resolution: "1080 × 1920",
  duration: "8s Looping",
  tokenStandard: "ERC-721",
  royalty: "5%"
};
