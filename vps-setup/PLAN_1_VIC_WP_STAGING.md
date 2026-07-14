# PLAN 1: VIC Foundation WordPress Staging

**Date:** 2026-07-14
**Status:** DRAFT — SECURITY AND LIVE VERIFICATION REQUIRED
**Server:** VPS1 (`62.146.175.67`)
**Target:** `staging.vicfoundation.com`

## Required Corrections Implemented
- **PHP 8.3+:** Specified PHP 8.3 installation.
- **Pinned Release & Checksum:** Fixed to WordPress 6.5.4 with SHA1 verification.
- **Origin TLS:** Cloudflare Origin Cert mandatory before Full Strict.
- **Dedicated User:** Created `vicwp` user for isolation.
- **Authenticated/Noindex:** Basic Auth and robots.txt blocking.
- **Migration & Rollback:** Detailed below.

## Implementation Plan

### 1. Dedicated User & PHP 8.3
```bash
# Add dedicated user for isolation
sudo useradd -m -s /bin/bash vicwp

# Install PHP 8.3
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3-fpm php8.3-mysql php8.3-xml php8.3-mbstring php8.3-curl mariadb-server

# Configure PHP-FPM pool for vicwp
# /etc/php/8.3/fpm/pool.d/vicwp.conf
# [vicwp]
# user = vicwp
# group = vicwp
# listen = /run/php/php8.3-fpm-vicwp.sock
```

### 2. Database Setup
```sql
CREATE DATABASE vic_staging;
CREATE USER 'vicwp_db'@'localhost' IDENTIFIED BY '[GENERATED_SECRET]';
GRANT ALL PRIVILEGES ON vic_staging.* TO 'vicwp_db'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Pinned WordPress Installation
```bash
sudo su - vicwp
mkdir -p /home/vicwp/public_html
cd /home/vicwp/public_html

# Download pinned version and verify checksum
wget https://wordpress.org/wordpress-6.5.4.tar.gz
wget https://wordpress.org/wordpress-6.5.4.tar.gz.sha1
echo "$(cat wordpress-6.5.4.tar.gz.sha1)  wordpress-6.5.4.tar.gz" | sha1sum -c -

tar -xzf wordpress-6.5.4.tar.gz --strip-components=1
rm wordpress-6.5.4.tar.gz*
```

### 4. Origin TLS & Nginx
- Generate Cloudflare Origin Certificate for `*.vicfoundation.com`.
- Place in `/etc/ssl/certs/vicfoundation.pem` and `/etc/ssl/private/vicfoundation.key`.

```nginx
server {
    listen 443 ssl http2;
    server_name staging.vicfoundation.com;
    root /home/vicwp/public_html;
    index index.php;

    ssl_certificate /etc/ssl/certs/vicfoundation.pem;
    ssl_certificate_key /etc/ssl/private/vicfoundation.key;

    # Authenticated Staging
    auth_basic "Restricted Staging";
    auth_basic_user_file /etc/nginx/.htpasswd_vic;

    # Noindex Header
    add_header X-Robots-Tag "noindex, nofollow";

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm-vicwp.sock;
    }
}
```

### 5. Migration Plan
- Export GoDaddy DB and `wp-content`.
- Import DB to MariaDB.
- Rsync `wp-content` to `/home/vicwp/public_html/wp-content`.
- Update `wp-config.php` credentials.
- Run WP-CLI search-replace for domain update.

### 6. Rollback Design
- Remove Nginx config and reload.
- Drop database `vic_staging` and user `vicwp_db`.
- `userdel -r vicwp`.
- Remove PHP-FPM pool and restart PHP 8.3.
