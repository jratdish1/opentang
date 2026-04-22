# Security Hardening SOP — Updated April 21, 2026

## Tailscale Fleet
| Node | Tailscale IP | Public IP | Role | Tailscale SSH |
|------|-------------|-----------|------|---------------|
| VDS (vmi3196947) | 100.122.125.32 | 147.93.183.207 | Trading Bots / AI Agents | Enabled |
| VPS1 (vps1-mining) | 100.83.14.115 | 62.146.175.67 | Web Hosting Primary | Enabled |
| VPS2 (vps2-mirror) | 100.113.102.74 | 85.239.239.206 | Web Hosting Mirror | Enabled |
| VPS3 | N/A | 195.26.253.100 | HERO bots | N/A |
| BTC1 | 100.72.21.58 | 73.11.236.228 | Windows mining | N/A |
| VIC | 100.100.18.16 | 193.19.109.73 | Windows | N/A |
| Hetzner EU | N/A | 91.107.196.191 | Polymarket bot | N/A |
| Helsinki Proxy | N/A | 204.168.172.124 | SOCKS5 proxy | N/A |

## SSH Access (from VDS)
| Server | Alias | Key | Backup Key |
|--------|-------|-----|------------|
| VPS1 | `ssh vps1` | contabo_vds | id_rsa |
| VPS2 | `ssh vps2` | contabo_vds | id_rsa |
| VPS3 | `ssh vps3` | id_rsa | N/A |
| Hetzner EU | `ssh hetzner-eu` | hetzner_proxy | N/A |
| Helsinki | `ssh hetzner-hel` | hetzner_proxy | N/A |

## UFW Rules (VPS1 & VPS2)
- **SSH (22):** Allowed from Tailscale subnet (100.64.0.0/10) + VDS (147.93.183.207) ONLY
- **HTTP/HTTPS (80/443):** Allowed from Cloudflare IP ranges ONLY
- **Tailscale interface:** All traffic allowed on tailscale0
- **Default:** Deny all incoming, allow all outgoing

## SSH Hardening (All Servers)
- PasswordAuthentication: no
- PermitRootLogin: prohibit-password
- MaxAuthTries: 3
- LoginGraceTime: 30s
- X11Forwarding: no

## Fail2ban (All Servers)
- Ban time: 86400s (24 hours)
- Find time: 600s (10 minutes)
- Max retry: 3
- Whitelisted: 127.0.0.1, Tailscale (100.64.0.0/10), VDS (147.93.183.207)

## Kernel Hardening
- SYN flood protection (tcp_syncookies)
- IP spoofing prevention (rp_filter)
- ICMP redirect disabled
- Source routing disabled
- Martian packet logging enabled

## Verification Tests
1. SSH from non-whitelisted IP → TIMEOUT (confirmed)
2. HTTP to public IP directly → TIMEOUT (confirmed)
3. Websites via Cloudflare → 200 OK (confirmed)
4. SSH from VDS to VPS1/VPS2 → OK (confirmed)

## Cloudflare IP Ranges (whitelisted for HTTP/HTTPS)
173.245.48.0/20, 103.21.244.0/22, 103.22.200.0/22, 103.31.4.0/22,
141.101.64.0/18, 108.162.192.0/18, 190.93.240.0/20, 188.114.96.0/20,
197.234.240.0/22, 198.41.128.0/17, 162.158.0.0/15, 104.16.0.0/13,
104.24.0.0/14, 172.64.0.0/13, 131.0.72.0/22

## NOTE: Tailscale TCP Routing
TCP over Tailscale between VDS and VPS1/VPS2 currently times out despite Tailscale ping working.
This is a known issue with some Contabo VPS configurations where WireGuard uses IPv6 transport.
Workaround: Use VDS public IP SSH (whitelisted in UFW) as primary access method.
Tailscale SSH (built-in) is enabled as backup.
