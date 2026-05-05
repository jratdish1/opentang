#!/usr/bin/env python3
"""
HERO Shorts Auto-Scheduler for upload-post.com
==============================================
Uploads all 17 HERO Shorts to YouTube via upload-post.com API
Scheduled: May 11-27, 2026 at 7pm EST (23:00 UTC), one per day
Profile: novareign
Platform: YouTube

Usage:
  python3 hero_upload_post_scheduler.py          # Schedule all 17
  python3 hero_upload_post_scheduler.py --dry-run # Preview schedule only
  python3 hero_upload_post_scheduler.py --idx 0   # Schedule single short
"""

import os
import sys
import json
import time
import requests
from datetime import datetime, timedelta
from pathlib import Path

# ─── CONFIG ───────────────────────────────────────────────────────────────────
UPLOAD_POST_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFzc2F5LWhhenktMHpAaWNsb3VkLmNvbSIsImV4cCI6NDkzMTU0NDQ3NSwianRpIjoiYmU1YmFmMGMtY2FiMC00MmNmLTliZGItZWJjYTlhNDkwMjQ4In0.PjcCSTsRHNr71AJqD4KNiZ-UDdLWqJadV6-gYBJaevY"
UPLOAD_POST_USER    = "novareign"
UPLOAD_POST_API_URL = "https://api.upload-post.com/api/upload"
SHORTS_DIR          = "/opt/spotify-automation/hero_shorts"
LOG_FILE            = "/tmp/hero_upload_post.log"

# Schedule: May 11, 2026 at 7pm EST = 23:00 UTC
# One short per day for 17 days
SCHEDULE_START = datetime(2026, 5, 11, 23, 0, 0)  # 7pm EST = 23:00 UTC

# ─── HERO SHORTS METADATA ─────────────────────────────────────────────────────
HERO_SHORTS = [
    {
        "idx": 0,
        "title": "Bridge HERO: From BASE to PulseChain",
        "description": "Learn how to bridge $HERO Token between BASE and PulseChain networks in minutes. Veterans building financial freedom through crypto. 🎖️\n\n🌐 herobase.io\n📱 t.me/VetsInCrypto\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #BASE #PulseChain #VetsInCrypto #CryptoForVets #VICFoundation #VeteranFinancialFreedom #Crypto #Web3",
        "social": "t.me/VetsInCrypto"
    },
    {
        "idx": 1,
        "title": "HERO Roadmap 2026: Epic Upgrades Ahead",
        "description": "The $HERO Token roadmap for 2026 is LOADED. DEX upgrades, staking rewards, and veteran financial tools are coming. Stay locked in! 🎖️\n\n🌐 herobase.io\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #Roadmap2026 #VetsInCrypto #CryptoForVets #VICFoundation #VeteranFinancialFreedom",
        "social": "x.com/HERO501c3"
    },
    {
        "idx": 2,
        "title": "Unlock HERO DEX: Quick Guide",
        "description": "How to use the HERO DEX to trade $HERO Token on PulseChain and BASE. Fast, low fees, veteran-built. 🎖️\n\n🌐 herobase.io\n🐦 x.com/VICNONPROFIT\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #DEX #PulseChain #BASE #VICFoundation #VeteranFinancialFreedom",
        "social": "x.com/VICNONPROFIT"
    },
    {
        "idx": 3,
        "title": "Stake HERO for Easy Passive Income",
        "description": "Staking $HERO Token is one of the easiest ways for veterans to earn passive crypto income. Set it and forget it. 🎖️\n\n🌐 herobase.io\n📱 t.me/VetsInCrypto\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #Staking #PassiveIncome #VetsInCrypto #CryptoForVets #VICFoundation",
        "social": "t.me/VetsInCrypto"
    },
    {
        "idx": 4,
        "title": "What is HERO Token? The Crypto Superhero for Vets",
        "description": "Meet $HERO Token — the cryptocurrency built BY veterans FOR veterans. Financial freedom is the mission. 🎖️\n\n🌐 herobase.io\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #VetsInCrypto #CryptoForVets #VICFoundation #VeteranFinancialFreedom #Web3",
        "social": "x.com/HERO501c3"
    },
    {
        "idx": 5,
        "title": "HERO Wallet: Your Crypto Privacy Shield",
        "description": "The HERO Wallet gives veterans full control and privacy over their crypto assets. Your money, your rules. 🎖️\n\n🌐 herobase.io\n🐦 x.com/VICNONPROFIT\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #CryptoWallet #Privacy #VICFoundation #VeteranFinancialFreedom",
        "social": "x.com/VICNONPROFIT"
    },
    {
        "idx": 6,
        "title": "HERO Token Burn: Deflationary Power",
        "description": "Every $HERO Token burn makes the remaining supply more valuable. Deflationary tokenomics = veteran wealth building. 🎖️\n\n🌐 herobase.io\n📱 t.me/VetsInCrypto\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #TokenBurn #Deflationary #VetsInCrypto #VICFoundation",
        "social": "t.me/VetsInCrypto"
    },
    {
        "idx": 7,
        "title": "Unlock Crypto Rewards in VetsInCrypto",
        "description": "Join the VetsInCrypto community and unlock exclusive $HERO Token rewards, alpha, and veteran crypto education. 🎖️\n\n🌐 herobase.io\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #VetsInCrypto #CryptoRewards #VICFoundation #VeteranCommunity",
        "social": "x.com/HERO501c3"
    },
    {
        "idx": 8,
        "title": "HERO on BASE vs PulseChain: Chain Showdown",
        "description": "$HERO Token is on both BASE and PulseChain. Which chain wins? Speed, fees, and liquidity compared. 🎖️\n\n🌐 herobase.io\n🐦 x.com/VICNONPROFIT\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #BASE #PulseChain #ChainComparison #VICFoundation",
        "social": "x.com/VICNONPROFIT"
    },
    {
        "idx": 9,
        "title": "Crypto Security: Protect Your Coins Like a Vet",
        "description": "Veterans know how to protect what matters. Here's how to secure your $HERO Token and crypto like a pro. 🎖️\n\n🌐 herobase.io\n📱 t.me/VetsInCrypto\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #CryptoSecurity #VetsInCrypto #VICFoundation #CryptoSafety",
        "social": "t.me/VetsInCrypto"
    },
    {
        "idx": 10,
        "title": "Earn Passive Income with Crypto Staking",
        "description": "Crypto staking is the veteran's way to earn while you sleep. $HERO Token staking rewards are waiting for you. 🎖️\n\n🌐 herobase.io\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #Staking #PassiveIncome #VICFoundation #CryptoForVets",
        "social": "x.com/HERO501c3"
    },
    {
        "idx": 11,
        "title": "Top 5 Reasons to HODL HERO Token",
        "description": "5 solid reasons why veterans are HODLing $HERO Token for the long haul. Financial freedom is the mission. 🎖️\n\n🌐 herobase.io\n🐦 x.com/VICNONPROFIT\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #HODL #VICFoundation #VeteranFinancialFreedom #CryptoForVets",
        "social": "x.com/VICNONPROFIT"
    },
    {
        "idx": 12,
        "title": "Crypto Tax Hacks for Vets: Avoid the Traps",
        "description": "Don't let the IRS ambush your crypto gains. Here are the top crypto tax strategies every veteran needs to know. 🎖️\n\n🌐 herobase.io\n📱 t.me/VetsInCrypto\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #CryptoTax #VetsInCrypto #VICFoundation #VeteranFinance",
        "social": "t.me/VetsInCrypto"
    },
    {
        "idx": 13,
        "title": "Unlock Daily Crypto Profits with Mining",
        "description": "Crypto mining can generate daily income for veterans. Here's how to get started with minimal investment. 🎖️\n\n🌐 herobase.io\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #CryptoMining #PassiveIncome #VICFoundation #CryptoForVets",
        "social": "x.com/HERO501c3"
    },
    {
        "idx": 14,
        "title": "PulseChain: Why HERO is Speeding Ahead",
        "description": "PulseChain's speed and low fees make it the perfect home for $HERO Token. Veterans deserve fast, cheap transactions. 🎖️\n\n🌐 herobase.io\n🐦 x.com/VICNONPROFIT\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #PulseChain #VICFoundation #VeteranFinancialFreedom",
        "social": "x.com/VICNONPROFIT"
    },
    {
        "idx": 15,
        "title": "HERO Token: Veteran Financial Freedom Mission",
        "description": "The $HERO Token mission is veteran financial freedom. Join the movement and take control of your financial future. 🎖️\n\n🌐 herobase.io\n📱 t.me/VetsInCrypto\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #VeteranFinancialFreedom #VetsInCrypto #VICFoundation #CryptoForVets",
        "social": "t.me/VetsInCrypto"
    },
    {
        "idx": 16,
        "title": "What is V.I.C. Foundation? Veterans In Crisis",
        "description": "V.I.C. Foundation — Veterans In Crisis — is the nonprofit behind $HERO Token. Every transaction supports veterans in need. 🎖️\n\n🌐 herobase.io\n🐦 x.com/HERO501c3\n\n$HERO is available on BASE and PulseChain. V.I.C. Foundation | Veterans In Crisis\n\nVeterans Crisis Line: 988 Press 1\n\n#HERO #HEROToken #VeteranCrypto #VICFoundation #VeteransInCrisis #VetsInCrypto #501c3 #VeteranCharity",
        "social": "x.com/HERO501c3"
    }
]

# ─── LOGGING ──────────────────────────────────────────────────────────────────
def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

# ─── UPLOAD TO UPLOAD-POST.COM ────────────────────────────────────────────────
def schedule_short(short_data, scheduled_dt, dry_run=False):
    """Upload a HERO Short to upload-post.com scheduled for a specific datetime."""
    idx = short_data["idx"]
    title = short_data["title"]
    description = short_data["description"]
    video_path = os.path.join(SHORTS_DIR, f"hero_short_{idx:02d}.mp4")

    if not os.path.exists(video_path):
        log(f"  ❌ MISSING: {video_path}")
        return False

    # Format schedule time for API (ISO 8601)
    schedule_str = scheduled_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

    log(f"\n[{idx+1}/17] {title}")
    log(f"  File: {video_path} ({os.path.getsize(video_path) // 1024}KB)")
    log(f"  Scheduled: {scheduled_dt.strftime('%Y-%m-%d %I:%M %p UTC')} (7pm EST)")
    log(f"  Social: {short_data['social']}")

    if dry_run:
        log(f"  [DRY RUN] Would upload to YouTube via novareign profile")
        return True

    try:
        with open(video_path, "rb") as video_file:
            response = requests.post(
                UPLOAD_POST_API_URL,
                headers={"Authorization": f"Apikey {UPLOAD_POST_API_KEY}"},
                data={
                    "title": title,
                    "description": description,
                    "user": UPLOAD_POST_USER,
                    "platform[]": "youtube",
                    "schedule": schedule_str,
                    "youtube_title": title,
                    "youtube_description": description,
                    "youtube_tags": "HERO,HEROToken,VeteranCrypto,VetsInCrypto,CryptoForVets,VICFoundation,VeteranFinancialFreedom,BASE,PulseChain,Crypto,Web3,Shorts",
                    "youtube_category": "22",  # People & Blogs
                    "youtube_privacy": "public",
                    "youtube_shorts": "true",
                    "youtube_made_for_kids": "false",
                },
                files={"video": (f"hero_short_{idx:02d}.mp4", video_file, "video/mp4")},
                timeout=120
            )

        if response.status_code in (200, 201):
            result = response.json()
            log(f"  ✅ Scheduled! Response: {json.dumps(result, indent=2)[:200]}")
            return True
        else:
            log(f"  ❌ Failed: HTTP {response.status_code} — {response.text[:300]}")
            return False

    except Exception as e:
        log(f"  ❌ Exception: {e}")
        return False

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    dry_run = "--dry-run" in sys.argv
    single_idx = None
    start_from = 0
    if "--idx" in sys.argv:
        try:
            single_idx = int(sys.argv[sys.argv.index("--idx") + 1])
        except (IndexError, ValueError):
            pass
    if "--start" in sys.argv:
        try:
            start_from = int(sys.argv[sys.argv.index("--start") + 1])
        except (IndexError, ValueError):
            pass

    log("=" * 60)
    log("HERO Shorts Auto-Scheduler — upload-post.com")
    log(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    log(f"Profile: {UPLOAD_POST_USER} | Platform: YouTube")
    log(f"Schedule: May 11-27, 2026 @ 7pm EST (23:00 UTC)")
    log(f"Starting from index: {start_from}")
    log("=" * 60)

    success = 0
    failed = 0

    if single_idx is not None:
        shorts_to_process = [HERO_SHORTS[single_idx]]
    elif start_from > 0:
        shorts_to_process = HERO_SHORTS[start_from:]
    else:
        shorts_to_process = HERO_SHORTS

    for i, short_data in enumerate(shorts_to_process):
        actual_idx = short_data["idx"]
        # Calculate schedule date: May 11 + actual_idx days
        scheduled_dt = SCHEDULE_START + timedelta(days=actual_idx)

        result = schedule_short(short_data, scheduled_dt, dry_run=dry_run)
        if result:
            success += 1
        else:
            failed += 1

        # Rate limit: wait 3 seconds between uploads
        if i < len(shorts_to_process) - 1 and not dry_run:
            log("  Waiting 3s before next upload...")
            time.sleep(3)

    log("\n" + "=" * 60)
    log(f"COMPLETE: {success} scheduled, {failed} failed")
    log("=" * 60)

    # Print schedule summary
    log("\n📅 HERO Shorts YouTube Schedule:")
    for short in HERO_SHORTS:
        scheduled_dt = SCHEDULE_START + timedelta(days=short["idx"])
        log(f"  {scheduled_dt.strftime('%b %d')} 7pm EST — Short {short['idx']+1:02d}: {short['title']}")

if __name__ == "__main__":
    main()
