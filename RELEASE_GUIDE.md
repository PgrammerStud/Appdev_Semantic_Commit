# Complete App Release Guide

**App**: Delivery Management System (React Native + Symfony Backend)  
**Release Date**: May 26, 2026  
**Version**: 1.0.0

---

## Table of Contents

1. [Pre-Release Checklist](#pre-release-checklist)
2. [Android App Release](#android-app-release)
3. [iOS App Release](#ios-app-release)
4. [Backend API Deployment](#backend-api-deployment)
5. [WebSocket Server Deployment](#websocket-server-deployment)
6. [Post-Release Tasks](#post-release-tasks)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Release Checklist

### Phase 1: Code Quality & Testing

- [ ] **All tests passing**
  ```bash
  cd c:\Users\rune\AppdevActivity
  npm test
  ```

- [ ] **No console errors/warnings**
  - Build and test app on both iOS and Android
  - Check browser/device console for errors
  - Run in production mode

- [ ] **ESLint passing**
  ```bash
  npm run lint
  ```

- [ ] **No security vulnerabilities**
  ```bash
  npm audit
  ```

- [ ] **API endpoints tested**
  - Test all REST endpoints with real data
  - Verify authentication/JWT tokens work
  - Test with different user roles (customer, staff, admin)

- [ ] **WebSocket tested**
  - Test real-time messaging
  - Test delivery status updates
  - Test typing indicators

- [ ] **Firebase configured**
  - google-services.json in Android
  - GoogleService-Info.plist in iOS
  - FCM tokens tested
  - Test push notifications

- [ ] **Stripe configured**
  - Payment flow tested
  - Webhooks verified
  - Test transaction success/failure

- [ ] **Google Maps API**
  - Location tracking working
  - Route optimization tested
  - No API errors

- [ ] **Database migrations**
  ```bash
  # Backend
  php bin/console doctrine:migrations:status
  php bin/console doctrine:migrations:migrate
  ```

### Phase 2: Configuration Review

- [ ] **Update version numbers**
  - `package.json` (npm version)
  - `app.json` (React Native version)
  - Backend: Update API version in `config/services.yaml`

- [ ] **Environment variables correct**
  ```bash
  # Frontend
  .env.production
  - API_BASE_URL=https://api.yourdomain.com
  - WS_URL=wss://ws.yourdomain.com:8080
  - FIREBASE_CONFIG=correct credentials
  - STRIPE_PUBLISHABLE_KEY=production key
  
  # Backend
  .env.production
  - DATABASE_URL=production db
  - JWT_SECRET_KEY=secure key
  - CORS_ALLOW_ORIGIN=https://yourdomain.com
  - MAIL_FROM_ADDRESS=noreply@yourdomain.com
  ```

- [ ] **API endpoints pointing to production**
  - Base URL: `https://api.yourdomain.com`
  - WebSocket URL: `wss://ws.yourdomain.com:8080`
  - No localhost/staging URLs

- [ ] **SSL/TLS certificates installed**
  - HTTPS on API domain
  - WSS on WebSocket domain
  - Certificates valid and not expiring soon

- [ ] **CORS configured correctly**
  - Allow frontend domain only
  - Restrict sensitive endpoints

- [ ] **Rate limiting enabled**
  - API: 100 req/min per IP
  - Login: 5 attempts per 15 min
  - WebSocket: Connection limits

### Phase 3: Documentation Updated

- [ ] **README.md current**
  - Latest version documented
  - Installation steps accurate

- [ ] **CHANGELOG.md created**
  ```
  # Version 1.0.0 (May 26, 2026)
  
  ## New Features
  - Real-time messaging with WebSocket
  - Role-based access control
  - Order tracking with GPS
  - Payment processing with Stripe
  - Push notifications
  
  ## Bug Fixes
  - Fixed auth token expiration
  - Improved image loading
  
  ## Breaking Changes
  - None
  ```

- [ ] **API documentation updated**
  - All endpoints documented
  - Request/response examples provided
  - Authentication requirements listed

- [ ] **User guides finalized**
  - Tested with real users
  - Screenshots current
  - Instructions accurate

### Phase 4: Security & Privacy

- [ ] **API keys rotated**
  - Firebase keys regenerated
  - Stripe keys refreshed
  - JWT secret updated

- [ ] **Sensitive data removed**
  - No hardcoded API keys in code
  - No test data in production database
  - Logs don't contain sensitive info

- [ ] **GDPR/Privacy compliance**
  - Privacy policy updated
  - User data handling documented
  - Cookie consent implemented

- [ ] **Encryption enabled**
  - HTTPS/WSS in use
  - Database passwords encrypted
  - Secrets in environment variables

- [ ] **Database backup tested**
  ```bash
  # Backend
  php bin/console doctrine:database:create
  php bin/console doctrine:migrations:migrate
  ```

---

## Android App Release

### Step 1: Build Signed APK

```bash
cd c:\Users\rune\AppdevActivity

# Clean previous builds
rm -r android/app/build

# Generate signed APK
# (If you don't have a keystore, create one first - see Step 2)
cd android
./gradlew clean bundleRelease

# Or for APK (older method):
./gradlew clean assembleRelease
```

### Step 2: Create Keystore (If First Time)

```bash
# Generate keystore file
keytool -genkey -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# When prompted, enter:
# - Password: [strong password - save it!]
# - First and last name: Your Name
# - Organization: Your Company
# - City: Your City
# - State: Your State
# - Country: Your Country Code (US, etc)

# Store keystore in safe location:
# cp my-release-key.keystore ~/.android/

# Record in secure location:
# Keystore password: _______________
# Key alias: my-key-alias
# Key password: _______________
```

### Step 3: Configure Release Build

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'KEYSTORE_PASSWORD'
            keyAlias 'my-key-alias'
            keyPassword 'KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Verify Build Works

```bash
cd c:\Users\rune\AppdevActivity

# Test on Android device
adb install android/app/build/outputs/bundle/release/app-release.aab

# Or test APK
npx react-native run-android --variant=release
```

### Step 5: Upload to Google Play Store

1. **Go to Google Play Console**
   - URL: https://play.google.com/console
   - Sign in with Google account

2. **Create New App** (if first time)
   - Click "Create app"
   - Enter app name: "Delivery Management"
   - Select category: "Business" or "Shopping"
   - Fill in store listing details

3. **Prepare Store Listing**
   - App title: "Delivery Management"
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots: 5-8 screenshots (1080x1920 px)
   - Feature graphic (1024x500 px)
   - Icon (192x192 px)
   - Contact email
   - Privacy policy URL
   - Content rating questionnaire

4. **Set Up Pricing & Distribution**
   - Price: Free or paid
   - Countries: Select distribution
   - Content rating: Complete questionnaire
   - Google Play Policies: Agree to policies

5. **Upload Release**
   - Go to "Release" → "Production"
   - Click "Create new release"
   - Upload `app-release.aab` file
   - Add release notes:
     ```
     Version 1.0.0
     
     Welcome to Delivery Management!
     
     Features:
     - Real-time order tracking
     - Live messaging with delivery staff
     - Secure payment processing
     - Push notifications for updates
     - Easy order history
     
     Thank you for using our app!
     ```
   - Review content rating
   - Accept declaration
   - Click "Review release"

6. **Final Review & Publish**
   - Review all details
   - Check preview on different devices
   - Click "Start rollout to Production"
   - Choose rollout percentage (100% for full release)

7. **Monitor Rollout**
   - Check "Release dashboard"
   - Wait for Google to approve (usually 2-24 hours)
   - Monitor crash rates and reviews
   - Watch for user feedback

### Step 6: Track Android Release Status

```bash
# Check release status
curl -X GET "https://play.google.com/console/api/apps/PACKAGE_NAME/releases"

# Monitor in Play Console:
# - Go to "Releases" → "Production"
# - View release status, rollout percentage
# - Monitor crashes, ANR rate
# - Check user reviews
```

---

## iOS App Release

### Step 1: Update Version Numbers

Edit `ios/Project/Info.plist`:

```xml
<key>CFBundleShortVersionString</key>
<string>1.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

Also update in Xcode:
- Select `Project` in Xcode
- Select `Project` (not target)
- Go to "Build Settings"
- Set "Bundle Version" to "1"
- Set "Bundle Version Short String" to "1.0"

### Step 2: Build for Release

```bash
cd c:\Users\rune\AppdevActivity/ios

# Clean previous build
rm -rf build

# Build for release
xcodebuild -workspace Project.xcworkspace \
  -scheme Project \
  -configuration Release \
  -derivedDataPath build \
  -archivePath build/Project.xcarchive \
  archive
```

Or use Xcode GUI:
1. Open `ios/Project.xcworkspace` in Xcode
2. Select "Project" scheme (top left)
3. Select "Generic iOS Device" (not simulator)
4. Product → Scheme → Edit Scheme
5. Set to "Release" build configuration
6. Product → Archive
7. Wait for build to complete

### Step 3: Create App Store Distribution Certificate

1. **Go to Apple Developer Account**
   - URL: https://developer.apple.com/account
   - Sign in with Apple ID

2. **Create Certificate**
   - Go to "Certificates, Identifiers & Profiles"
   - Click "Certificates" → "+"
   - Select "App Store and Ad Hoc"
   - Follow prompts to create certificate
   - Download certificate (.cer file)
   - Double-click to install in Keychain

3. **Create App ID** (if not already done)
   - Go to "Identifiers" → "+"
   - Select "App ID"
   - Enter Bundle ID: `com.yourcompany.deliveryapp`
   - Enable required capabilities:
     - Push Notifications
     - Maps
     - Location Services
   - Click "Register"

4. **Create Provisioning Profile**
   - Go to "Profiles" → "+"
   - Select "App Store"
   - Select your App ID
   - Select certificate
   - Enter profile name: "DeliveryApp Distribution"
   - Download profile
   - Double-click to install

### Step 4: Export App for Distribution

In Xcode:
1. Select your archive in Organizer (Window → Organizer)
2. Click "Distribute App"
3. Select "App Store Connect"
4. Select "Upload"
5. Choose signing certificate (should auto-select)
6. Review options
7. Click "Upload"
8. Wait for upload to complete

### Step 5: Submit to App Store

1. **Go to App Store Connect**
   - URL: https://appstoreconnect.apple.com
   - Sign in with Apple ID

2. **Create App** (if first time)
   - Click "My Apps" → "+"
   - Enter app name: "Delivery Management"
   - Select bundle ID: `com.yourcompany.deliveryapp`
   - Select SKU (can be anything unique)

3. **Fill in App Information**
   - App Store Connect ID (auto-generated)
   - Bundle ID (auto-set)
   - SKU (unique identifier)

4. **Configure App Store Listing**
   - Name: "Delivery Management"
   - Subtitle: "Fast, reliable deliveries"
   - Description:
     ```
     Get your items delivered safely and on time.
     
     Features:
     - Real-time order tracking with GPS
     - Live chat with delivery drivers
     - Secure payment processing
     - Instant push notifications
     - Order history and receipts
     
     Download now and start ordering!
     ```
   - Keywords: "delivery,shopping,orders,shopping app"
   - Support URL: "https://yourdomain.com/support"
   - Privacy Policy URL: "https://yourdomain.com/privacy"
   - Category: "Shopping"
   - Content Rating: "4+"

5. **Upload Screenshots & Media**
   - Screenshots (5.5" display, 1242x2208 px minimum):
     - Home screen
     - Browse products
     - Order details
     - Real-time tracking
     - Chat interface
   - App Preview (30-second video, optional)
   - Icon (1024x1024 px)

6. **Build Information**
   - Select build (should see your uploaded build)
   - Test Flight (optional - for beta testing first)

7. **Pricing & Availability**
   - Price: Free or paid
   - Countries/regions: Select distribution
   - Effective date: Immediate or choose date

8. **General Information**
   - Age Rating: 4+
   - Copyright: "© 2026 Your Company"
   - Routing App Coverage: No

9. **Submit for Review**
   - Review all information
   - Check compliance:
     - [ ] Uses encryption
     - [ ] No HTTPS required (already using)
     - [ ] Location Services: Yes (delivery tracking)
   - Accept terms
   - Click "Submit for Review"

10. **Monitor Review Status**
    - Check "Activity" tab
    - Wait for review (usually 24-48 hours)
    - Monitor App Store review feedback

### Step 6: Track iOS Release Status

```bash
# Monitor in App Store Connect:
# 1. Go to "TestFlight" → "Builds"
# 2. Check build processing status
# 3. Review tester feedback
# 4. Go to "Pricing and Availability" for release date
# 5. Monitor sales and reviews after launch
```

---

## Backend API Deployment

### Step 1: Prepare Backend Server

**Recommended: Google Cloud Run or AWS Lambda**

#### Option A: Google Cloud Run (Recommended)

1. **Install Google Cloud SDK**
   ```bash
   # Windows
   https://cloud.google.com/sdk/docs/install
   
   # Initialize
   gcloud init
   gcloud auth login
   ```

2. **Create Cloud Run Service**
   ```bash
   gcloud run deploy delivery-api \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Configure Environment Variables**
   ```bash
   gcloud run services update delivery-api \
     --region us-central1 \
     --set-env-vars "DATABASE_URL=postgresql://user:pass@cloudsql-instance/db"
   ```

#### Option B: Traditional VPS (DigitalOcean, Linode, AWS EC2)

1. **Rent VPS**
   - 2-4 CPU cores
   - 4-8 GB RAM
   - 50-100 GB SSD
   - Ubuntu 20.04 LTS or later

2. **SSH into server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install PHP 8.1
   apt install -y php8.1-cli php8.1-fpm php8.1-mysql
   
   # Install Composer
   curl -sS https://getcomposer.org/installer | php
   mv composer.phar /usr/local/bin/composer
   
   # Install Nginx
   apt install -y nginx
   
   # Install PostgreSQL (if not using managed)
   apt install -y postgresql postgresql-contrib
   
   # Install Node.js (for WebSocket server)
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash
   apt install -y nodejs
   ```

### Step 2: Deploy Symfony Backend

```bash
# On your local machine
cd /path/to/backend

# Push to git (required for Cloud Run)
git add .
git commit -m "Release v1.0.0"
git push origin main

# On server (if VPS)
cd /var/www
git clone https://github.com/yourname/backend-repo.git delivery-api
cd delivery-api

# Or download directly
wget https://github.com/yourname/backend-repo/archive/main.zip
unzip main.zip
cd backend-main
```

### Step 3: Install Symfony Dependencies

```bash
cd /var/www/delivery-api

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Generate cache
php bin/console cache:clear --env=prod

# Create .env.local
cp .env .env.local

# Edit .env.local with production values
nano .env.local

# Save these values:
# DATABASE_URL=postgresql://postgres:password@localhost/delivery_db
# JWT_SECRET_KEY=your-secure-random-key
# APP_ENV=prod
# APP_DEBUG=0
```

### Step 4: Setup Database

```bash
# Create database
php bin/console doctrine:database:create

# Run migrations
php bin/console doctrine:migrations:migrate --no-interaction

# Load fixtures (optional - sample data)
php bin/console doctrine:fixtures:load --no-interaction
```

### Step 5: Configure Web Server

**For Nginx:**

Create `/etc/nginx/sites-available/delivery-api.conf`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/delivery-api/public;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    root /var/www/delivery-api/public;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
    }

    location ~ \.php$ {
        return 404;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/delivery-api.conf /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: Setup SSL Certificate

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Generate certificate
certbot certonly --nginx -d api.yourdomain.com

# Auto-renew (runs daily)
systemctl enable certbot.timer
```

### Step 7: Setup PHP-FPM

Edit `/etc/php/8.1/fpm/php.ini`:

```ini
# Increase limits
upload_max_filesize = 20M
post_max_size = 20M
max_execution_time = 30
memory_limit = 256M
```

Restart:
```bash
systemctl restart php8.1-fpm
```

### Step 8: Enable CORS & Security

Edit `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
    defaults:
        origin_regex: true
        allow_origin: ['https://yourdomain.com']
        allow_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        allow_headers: ['Content-Type', 'Authorization']
        expose_headers: ['Link']
        max_age: 3600
```

### Step 9: Setup Monitoring & Logging

```bash
# Install New Relic (optional monitoring)
# https://newrelic.com

# Or use open source: Prometheus + Grafana
apt install -y prometheus grafana-server

# Start services
systemctl enable prometheus
systemctl enable grafana-server
systemctl start prometheus
systemctl start grafana-server
```

### Step 10: Test API

```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Should return: {"status":"OK"}

# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## WebSocket Server Deployment

### Step 1: Setup WebSocket Server

```bash
# On your production server
cd /var/www

# Clone or create WebSocket server
mkdir delivery-websocket
cd delivery-websocket

# Create composer.json
cat > composer.json << 'EOF'
{
    "require": {
        "cboden/ratchet": "^0.4"
    }
}
EOF

# Install
composer install
```

### Step 2: Create WebSocket Handler

Create `src/Chat.php`:

```php
<?php
namespace DeliveryApp;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chat implements MessageComponentInterface {
    protected $clients;
    protected $connections;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->connections = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        echo "New connection: {$conn->resourceId}\n";
        $this->clients->attach($conn);
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg);
        
        if ($data->type === 'authenticate') {
            $this->connections[$from->resourceId] = $data->userId;
            $from->send(json_encode(['type' => 'authenticated', 'userId' => $data->userId]));
        }
        
        if ($data->type === 'message') {
            // Route to recipient
            foreach ($this->clients as $client) {
                if (isset($this->connections[$client->resourceId])) {
                    if ($this->connections[$client->resourceId] == $data->recipientId) {
                        $client->send($msg);
                    }
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        unset($this->connections[$conn->resourceId]);
        $this->clients->detach($conn);
        echo "Connection closed: {$conn->resourceId}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}
EOF
```

### Step 3: Create WebSocket Startup Script

Create `server.php`:

```php
<?php
require 'vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use DeliveryApp\Chat;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Chat()
        )
    ),
    8080
);

echo "WebSocket server starting on ws://localhost:8080\n";
$server->run();
EOF
```

### Step 4: Setup Systemd Service

Create `/etc/systemd/system/delivery-websocket.service`:

```ini
[Unit]
Description=Delivery WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/delivery-websocket
ExecStart=/usr/bin/php /var/www/delivery-websocket/server.php
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl daemon-reload
systemctl enable delivery-websocket
systemctl start delivery-websocket
```

### Step 5: Setup SSL/TLS for WebSocket

```bash
# Install stunnel for WSS (WebSocket Secure)
apt install -y stunnel4

# Create /etc/stunnel/websocket.conf
cat > /etc/stunnel/websocket.conf << 'EOF'
[websocket]
accept = 8443
connect = 8080
cert = /etc/letsencrypt/live/ws.yourdomain.com/fullchain.pem
key = /etc/letsencrypt/live/ws.yourdomain.com/privkey.pem
EOF

# Enable stunnel
systemctl enable stunnel4
systemctl restart stunnel4
```

### Step 6: Configure Nginx Reverse Proxy

Add to `/etc/nginx/sites-available/delivery-websocket.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name ws.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ws.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ws.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable:
```bash
ln -s /etc/nginx/sites-available/delivery-websocket.conf /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Test WebSocket

```bash
# Check if running
systemctl status delivery-websocket

# Monitor logs
journalctl -u delivery-websocket -f

# Test connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  https://ws.yourdomain.com/
```

---

## Post-Release Tasks

### Immediate (First Hour)

- [ ] **Monitor app store reviews**
  - Google Play Store
  - Apple App Store
  - Watch for crash reports

- [ ] **Check crash logs**
  ```bash
  # Firebase Crashlytics
  # Check for runtime errors
  # Review stack traces
  ```

- [ ] **Monitor API logs**
  ```bash
  # Check backend logs
  tail -f /var/log/nginx/access.log
  tail -f /var/log/nginx/error.log
  journalctl -u php8.1-fpm -f
  ```

- [ ] **Monitor WebSocket connections**
  ```bash
  journalctl -u delivery-websocket -f
  ```

- [ ] **Test critical flows**
  - User login/registration
  - Browse products
  - Place order
  - Real-time chat
  - Payment processing
  - Location tracking

### First Day

- [ ] **Check analytics**
  - Firebase Analytics
  - User acquisition
  - Crash reports
  - Performance metrics

- [ ] **Monitor server performance**
  - CPU usage
  - Memory usage
  - Disk space
  - Database connections
  - API response times

- [ ] **Respond to user feedback**
  - Answer questions in reviews
  - Address critical issues
  - Gather feature requests

- [ ] **Prepare hotfix if needed**
  - Critical bug found?
  - Security issue?
  - Have hotfix ready

- [ ] **Send announcement email**
  ```
  Subject: Delivery Management App is Live! 🚀
  
  Hi there,
  
  We're excited to announce that the Delivery Management app is now 
  available on both iOS and Android!
  
  Download now:
  - iOS: [App Store link]
  - Android: [Google Play link]
  
  Welcome aboard!
  ```

### First Week

- [ ] **Analyze user behavior**
  - Top features used
  - Drop-off points
  - User journey optimization

- [ ] **Monitor financial metrics**
  - Transaction volume
  - Revenue
  - Payment success rate
  - Refund requests

- [ ] **Update documentation**
  - Add known issues
  - Update FAQs based on feedback
  - Document workarounds

- [ ] **Plan first update**
  - Prioritize bug fixes
  - Plan v1.1.0 features
  - Schedule next release

### Ongoing

- [ ] **Daily monitoring**
  - Error rates < 0.1%
  - API response time < 200ms
  - WebSocket latency < 500ms

- [ ] **Weekly reviews**
  - Release notes for bugs fixed
  - Performance improvements
  - User feedback compilation

- [ ] **Monthly maintenance**
  - Security patches
  - Dependency updates
  - Database optimization
  - Cost analysis

---

## Rollback Procedures

### If Critical Issue Found

**Android Rollback:**

```bash
# In Google Play Console
1. Go to "Release" → "Production"
2. Click the three dots on the release
3. Select "Stop rollout"
4. Previous version automatically restores
```

**iOS Rollback:**

```bash
# In App Store Connect
1. Go to "TestFlight" → "Builds"
2. Select previous build
3. Submit for review with note "Rollback"
4. Once approved, current version recovers
```

**Backend Rollback:**

```bash
# If using Git
git log --oneline
git revert abc123def  # Revert specific commit
git push production main

# If using containers
docker pull delivery-api:v0.9.0
docker run -d --name delivery-api-rollback delivery-api:v0.9.0

# If using database
php bin/console doctrine:migrations:migrate --to="previous_version"
```

**WebSocket Rollback:**

```bash
systemctl stop delivery-websocket
git checkout main~1  # Go to previous version
systemctl start delivery-websocket
```

---

## Troubleshooting

### Android Issues

**Issue: "App not found in Play Store"**
- Solution: Check if review is complete (takes 24-48 hours)
- Verify app complies with policies
- Check content rating

**Issue: "Installation fails on device"**
- Solution: Check Android version compatibility
- Verify APK/AAB is not corrupted
- Clear app cache: `adb shell pm clear com.package.name`

**Issue: "Crashes after launch"**
- Solution: Check Firebase Crashlytics
- Review logcat: `adb logcat`
- Check for missing resources or permissions

### iOS Issues

**Issue: "Stuck in review"**
- Solution: Check App Review status email
- Respond to reviewer feedback
- Resubmit if rejected

**Issue: "Build rejected"**
- Solution: Common reasons:
  - Guideline violations
  - Performance issues
  - Privacy concerns
  - Metadata mismatch
- Address each issue and resubmit

**Issue: "App crashes on iOS 16 only"**
- Solution: Test on actual iOS 16 device
- Check Swift/Objective-C compatibility
- Review iOS-specific code

### Backend Issues

**Issue: "API returns 500 error"**
```bash
# Check logs
tail -f /var/log/nginx/error.log

# Check database connection
php bin/console doctrine:database:connect

# Check permissions
ls -la /var/www/delivery-api/var/
chmod 775 /var/www/delivery-api/var/

# Restart PHP-FPM
systemctl restart php8.1-fpm
```

**Issue: "Database migration fails"**
```bash
# Check current state
php bin/console doctrine:migrations:status

# Manually verify database
psql -U postgres -d delivery_db -c "\dt"

# Rollback last migration
php bin/console doctrine:migrations:migrate --down
```

**Issue: "High API response time"**
```bash
# Check server resources
top
df -h
free -m

# Enable query logging
# Edit .env: DATABASE_LOGGING=true

# Monitor slow queries
tail -f /var/log/mysql/slow.log
```

### WebSocket Issues

**Issue: "Cannot connect to WebSocket"**
```bash
# Check if running
systemctl status delivery-websocket

# Check port
netstat -tuln | grep 8080

# Test locally
wscat -c ws://localhost:8080

# Check SSL certificate
openssl s_client -connect ws.yourdomain.com:8443
```

**Issue: "Messages not being delivered"**
```bash
# Check logs
journalctl -u delivery-websocket -n 100

# Monitor connections
# Add logging to Chat.php
// echo "Message from $from to $data->recipient\n";

# Test with simple message
// {"type":"message","recipientId":123,"text":"Hello"}
```

**Issue: "High latency in messages"**
- Check server load
- Check network connectivity
- Verify database queries not blocking
- Consider horizontal scaling

---

## Release Checklist Summary

```
PRE-RELEASE
✓ All tests passing
✓ No console errors
✓ Security audit passed
✓ Env variables configured
✓ SSL certificates ready
✓ Database backed up

ANDROID
✓ APK/AAB signed and built
✓ Uploaded to Play Store
✓ Store listing complete
✓ Screenshots added
✓ Released to production
✓ Monitoring enabled

iOS
✓ App archived in Xcode
✓ Uploaded to App Store Connect
✓ Store listing complete
✓ Screenshots and preview
✓ Submitted for review
✓ Monitoring enabled

BACKEND
✓ Code deployed to production
✓ Dependencies installed
✓ Migrations run
✓ Database configured
✓ SSL enabled
✓ Monitoring configured

WEBSOCKET
✓ Server deployed
✓ Systemd service enabled
✓ SSL/TLS configured
✓ Nginx reverse proxy set up
✓ Tested and verified
✓ Monitoring enabled

POST-RELEASE
✓ Monitoring active
✓ Error tracking enabled
✓ Analytics configured
✓ Team notified
✓ Documentation updated
✓ Support ready
```

---

## Success Metrics

### Within 1 Hour
- ✅ No critical crashes
- ✅ API responding < 200ms
- ✅ WebSocket connections stable

### Within 1 Day
- ✅ 100+ active users
- ✅ Error rate < 0.1%
- ✅ All payments processed successfully

### Within 1 Week
- ✅ 1,000+ downloads
- ✅ 4.0+ star rating
- ✅ No critical bugs unreported
- ✅ User retention > 70%

### Within 1 Month
- ✅ 10,000+ downloads
- ✅ Consistent 4.0+ rating
- ✅ Regular user engagement
- ✅ Revenue metrics positive

---

**Release Date**: May 26, 2026  
**Expected Timeline**: 2-4 weeks from start to production  
**Team**: Engineering, DevOps, Product, Marketing  
**Contact**: [your-email@company.com]

---

## Quick Reference

| Component | URL | Status |
|-----------|-----|--------|
| API | https://api.yourdomain.com | ✓ Production |
| WebSocket | wss://ws.yourdomain.com:8080 | ✓ Production |
| Android | [Play Store Link] | 🔄 Pending Review |
| iOS | [App Store Link] | 🔄 Pending Review |

**Last Updated**: May 26, 2026  
**Version**: 1.0.0  
**Status**: Ready for Release 🚀
