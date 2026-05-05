# Warriors Rest / Spotify Automation — Master TODO

**Last Updated:** 2026-05-05

---

## COMPLETED

- [x] Fix Suno generation — port 9225 (logged-in Chrome session)
- [x] Fix IPv6 [::1] → localhost connectivity issue
- [x] Confirm Suno auth: User "VETS -" logged in with valid Clerk JWT
- [x] Track generation confirmed: "SUCCESS: Generation started (2 loading elements)"
- [x] Wire Upload-Post API for Nova Reign social scheduling
- [x] Configure queue: 3 slots/day, 10am/2pm/6pm PST, all 7 days
- [x] Schedule 32 posts (TikTok video + Instagram photos) for May 5-8
- [x] Remove redundant cron-based nova_daily_poster.py

---

## IN PROGRESS

- [ ] Commit port 9225 fix to git (prevent reversion on deploy)
  ```bash
  cd /opt/spotify-automation && git add -A && git commit -m "fix: port 9225 for Suno CDP" && git push
  ```
- [ ] Verify track download pipeline works end-to-end (gen → download → pipeline)
- [ ] Set up Nova Reign Facebook Page for photo/video posts

---

## BACKLOG

### Pipeline Reliability
- [ ] Add health check for Chrome 9225 session validity (daily cron)
- [ ] Auto-refresh Suno session if Clerk token expires
- [ ] Add PID lock to wake scripts to prevent duplicate Chrome instances
- [ ] Monitor DistroKid upload success rate

### Content Generation
- [ ] Expand Suno prompt library (more genres: lo-fi, jazz, classical)
- [ ] Generate cover art variations for each track
- [ ] Create YT Shorts with better visualizers (waveform + album art)
- [ ] A/B test different YT Short thumbnail styles

### Distribution
- [ ] Connect Warriors Rest tracks to Nova Reign social accounts
- [ ] Auto-post new track releases to Instagram/TikTok via Upload-Post
- [ ] Set up Spotify for Artists claim for Warriors Rest profile
- [ ] Cross-promote tracks on herobase.io

### Monetization
- [ ] Track streaming revenue per track/platform
- [ ] Identify top-performing genres and double down
- [ ] Set up YouTube monetization for Shorts channel
- [ ] Explore sync licensing opportunities

---

## REFERENCE: Content Creation Workflow

### New Track (Automated — 4x daily)
1. Wake script ensures Chrome 9225 is running with Suno logged in
2. `suno_generate_warrior.py` connects via CDP to port 9225
3. Finds Suno tab, enters prompt, clicks Create
4. Suno generates 2 tracks (~60 seconds each)
5. `suno_api_client.py` polls for completed tracks, downloads .mp3
6. `warriors_rest_pipeline_v6.py` picks up new .mp3 files
7. Generates metadata (title, description, tags)
8. Generates cover art
9. Queues for DistroKid upload
10. Creates YT Short video
11. Posts to herobase.io
12. Sends Telegram report

### Nova Reign Social (Automated — 3x daily via Upload-Post)
1. Content queued via Upload-Post API with `add_to_queue=true`
2. Queue system auto-posts at configured time slots
3. Platforms: TikTok (video + photos), Instagram (photos + reels)
4. Facebook: Text posts only (until FB Page is created)

---

## KNOWN ISSUES

| Issue | Severity | Workaround |
|-------|----------|------------|
| Suno session expires periodically | Medium | Manual re-login via VNC |
| TikTok rejects non-portrait photos | Low | Resize to 1080x1350 before upload |
| Facebook needs Page for media posts | Medium | Create FB Page |
| DistroKid 2captcha sometimes fails | Low | Manual retry |
| Chrome 9225 can crash on OOM | Medium | Wake scripts auto-restart |

---
## SESSION UPDATE — 2026-05-04 — MANUS + BRAIN COLLABORATION

### HERO Shorts Pipeline — COMPLETED ✅
- [x] Built HERO Shorts pipeline v1 — 17 shorts, cinematic background, edge-tts neural voice
- [x] Generated 17 unique dark ambient background variants (per-short, HERO flag + Marine camo soldier)
- [x] Rebuilt all 17 shorts with v3 background (no shield, HERO flag with soldier logo, woodland camo)
- [x] herobase.io pinned at TOP of every short (permanent, not rotating)
- [x] Social links rotating: t.me/VetsInCrypto | x.com/HERO501c3 | x.com/VICNONPROFIT
- [x] All text in YouTube Shorts safe zones verified
- [x] Dark ambient background note: keep all future backgrounds moody/dim for resting viewers

### Upload-Post.com Integration — COMPLETED ✅
- [x] Researched upload-post.com API (REST API, Apikey auth, multi-platform scheduling)
- [x] Connected YouTube (V.I.C. FOUNDATION - REGEN VALOR channel) to novareign profile
- [x] Deployed hero_upload_post_scheduler.py to VDS
- [x] Scheduled 10/17 HERO Shorts on upload-post.com — May 11-20 at 7pm EST daily
- [x] YouTube post IDs confirmed: SM66AX2VPMc, wdYRbB7NlFU, cHQt5Cz0b0s, xrRHxwFiQSw, Ae0Kk2J8U4Q + 5 more
- [ ] PENDING: Schedule remaining 7 shorts (May 21-27) — cron set for May 6 6am UTC (daily cap reset)

### Auto-Publish Cron Jobs on VDS
- [x] hero_auto_publish.py — runs daily 11pm UTC (7pm EST) — flips private→public
- [x] hero_upload_post_scheduler.py --start 10 — runs May 6 6am UTC — schedules remaining 7 shorts

### Upload-Post.com API Notes (for Brain collaboration)
- API endpoint: https://api.upload-post.com/api/upload
- Auth: Authorization: Apikey <token>
- Profile: novareign
- YouTube daily cap: 10 uploads per 24 hours
- Schedule format: ISO 8601 UTC (2026-05-11T23:00:00.000Z = 7pm EST)
- YouTube Shorts flag: youtube_shorts=true
- Privacy: youtube_privacy=public (scheduled posts go public at scheduled time)
- Platforms available: youtube, instagram, tiktok, facebook, x, linkedin, pinterest, reddit, threads, bluesky

### Background Regeneration — IN PROGRESS
- [ ] Regenerate all 17 backgrounds with DARKER ambient (moody, dim, for resting viewers)
- [ ] Rebuild all 17 shorts with darker backgrounds
- [ ] Re-upload to upload-post.com (replace existing scheduled posts)

### Next Tasks for Brain
- [ ] Monitor upload-post.com calendar May 11-27 — verify all 17 HERO Shorts appear
- [ ] After May 27: Generate next batch of 17 HERO Shorts (new topics from herobase.io)
- [ ] Consider adding  token content to the pipeline
- [ ] Add Warriors Rest Shorts to upload-post.com schedule (separate from HERO)
- [ ] Explore upload-post.com multi-platform posting (TikTok, Instagram Reels) for HERO Shorts

