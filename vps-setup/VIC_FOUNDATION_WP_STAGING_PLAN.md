# VIC Foundation WP Staging Build Plan

**Date:** 2026-07-14
**Status:** APPROVED (VETS GO)
**Server:** VPS1 (`62.146.175.67`)
**Target:** `staging.vicfoundation.com`

## Objective
Deploy a self-hosted WordPress staging environment for VIC Foundation on VPS1, migrate content, and prepare for production cutover via MCP.

## Architecture
- **Web Server:** Nginx (already running on VPS1)
- **Database:** MariaDB/MySQL
- **Runtime:** PHP-FPM 8.2+
- **Domain:** `staging.vicfoundation.com` (Cloudflare proxied)
- **SSL:** Let's Encrypt / Cloudflare Origin Cert

## Implementation Steps

### 1. DNS & Cloudflare Setup
- Add A record for `staging.vicfoundation.com` pointing to VPS1 IP (`62.146.175.67`).
- Enable Cloudflare Proxy (Orange Cloud).
- Set SSL/TLS mode to Full (Strict).

### 2. VPS1 Environment Prep
```bash
# SSH to VPS1 via VDS-M
ssh vps1

# Install prerequisites if missing
sudo apt update
sudo apt install -y mariadb-server php-fpm php-mysql php-xml php-mbstring php-curl unzip
```

### 3. Database Configuration
```sql
CREATE DATABASE vic_staging;
CREATE USER 'vic_user'@'localhost' IDENTIFIED BY '[SECURE_PASSWORD]';
GRANT ALL PRIVILEGES ON vic_staging.* TO 'vic_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. WordPress Installation
```bash
mkdir -p /var/www/staging.vicfoundation.com
cd /var/www/staging.vicfoundation.com
wget https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress/* .
rm -rf wordpress latest.zip
chown -R www-data:www-data /var/www/staging.vicfoundation.com
```

### 5. Nginx Configuration
Create `/etc/nginx/sites-available/vic-staging`:
```nginx
server {
    listen 80;
    server_name staging.vicfoundation.com;
    root /var/www/staging.vicfoundation.com;
    index index.php index.html index.htm;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    }
}
```
Enable and reload:
```bash
ln -s /etc/nginx/sites-available/vic-staging /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 6. Security Hardening
- Install Wordfence plugin.
- Disable XML-RPC if not used by MCP.
- Restrict `/wp-admin` access if possible.

### 7. MCP Integration
- Configure the WordPress REST API for Manus MCP access.
- Generate Application Passwords for secure API authentication.

## Rollback / Cleanup
- `rm -rf /var/www/staging.vicfoundation.com`
- `rm /etc/nginx/sites-enabled/vic-staging`
- `DROP DATABASE vic_staging;`
- `systemctl reload nginx`
