// PM2 Ecosystem Config — Apex Kraken Bots
// Manages: volt_kraken (Kraken CEX trading) + hero_farm_arb (HERO DEX arb)
module.exports = {
  apps: [
    {
      name: 'trading-safety',
      script: '/opt/apex-agent/trading_safety.py',
      interpreter: 'python3',
      cwd: '/opt/apex-agent',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      log_file: '/opt/apex-agent/logs/trading_safety.log',
      error_file: '/opt/apex-agent/logs/trading_safety_error.log',
    },
    {
      name: "volt-kraken",
      script: "/opt/apex-agent/volt_kraken.py",
      interpreter: "python3",
      cwd: "/opt/apex-agent",
      restart_delay: 30000,       // 30s before restart
      max_restarts: 10,
      min_uptime: "60s",
      watch: false,
      env: {
        PYTHONUNBUFFERED: "1",
        KRAKEN_LIVE_MODE: "1",    // PAPER mode — set to "1" for live
      },
      log_file: "/opt/apex-agent/logs/volt_kraken.log",
      error_file: "/opt/apex-agent/logs/volt_kraken_error.log",
      merge_logs: true,
      time: true,
    },
    {
      name: "hero-farm-arb",
      script: "/opt/apex-agent/hero_farm_arb.py",
      interpreter: "python3",
      cwd: "/opt/apex-agent",
      restart_delay: 30000,
      max_restarts: 10,
      min_uptime: "60s",
      watch: false,
      env: {
        PYTHONUNBUFFERED: "1",
        HERO_ARB_LIVE: "1",       // SIMULATE mode — set to "1" for live
      },
      log_file: "/opt/apex-agent/logs/hero_arb.log",
      error_file: "/opt/apex-agent/logs/hero_arb_error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
  // CoinGecko API Key available via env: COINGECKO_API_KEY
