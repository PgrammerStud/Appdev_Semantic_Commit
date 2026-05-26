# TECHNICAL DOCUMENTATION

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Installation Guide](#installation-guide)
3. [Configuration & Setup](#configuration--setup)
4. [API Documentation](#api-documentation)
5. [WebSocket Implementation](#websocket-implementation)
6. [Database Schema](#database-schema)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## ARCHITECTURE OVERVIEW

### System Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│          PRESENTATION LAYER (React Native)          │
│  ├─ Customer Mobile App                             │
│  ├─ Rider Mobile App                                │
│  └─ Admin Dashboard (Web Optional)                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────┐
│          API LAYER (Symfony + REST)                 │
│  ├─ Authentication Controller                       │
│  ├─ Product Controller                              │
│  ├─ Order Controller                                │
│  ├─ User Management Controller                      │
│  ├─ Payment Controller                              │
│  └─ Notification Controller                         │
└──────────────────────┬──────────────────────────────┘
                       │ Internal Communication
┌──────────────────────▼──────────────────────────────┐
│        BUSINESS LOGIC LAYER (Services)              │
│  ├─ AuthService                                     │
│  ├─ OrderService                                    │
│  ├─ DeliveryService                                 │
│  ├─ PaymentService (Stripe integration)             │
│  ├─ NotificationService (Firebase integration)      │
│  └─ LocationService (Google Maps integration)       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│    DATA ACCESS LAYER (Doctrine ORM / Database)      │
│  ├─ User Repository                                 │
│  ├─ Order Repository                                │
│  ├─ Product Repository                              │
│  ├─ Message Repository                              │
│  └─ Payment Repository                              │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│    DATABASE LAYER (PostgreSQL / MySQL)              │
│  ├─ Users Table                                     │
│  ├─ Products Table                                  │
│  ├─ Orders Table                                    │
│  ├─ Messages Table                                  │
│  ├─ Payments Table                                  │
│  └─ Deliveries Table                                │
└─────────────────────────────────────────────────────┘
```

### Real-time Communication (Separate Layer)

```
┌─────────────────────────────────────────────────────┐
│     WebSocket Server (Ratchet on Port 8080)        │
│  ├─ Connection Manager                              │
│  ├─ Message Broadcaster                             │
│  ├─ Location Stream Handler                         │
│  └─ Notification Dispatcher                         │
└──────────────────────┬──────────────────────────────┘
                       │ WSS (WebSocket Secure)
                       │
          ┌────────────┼────────────┐
          │            │            │
    ┌─────▼────┐ ┌─────▼────┐ ┌────▼──────┐
    │ Customer │ │  Rider   │ │  Admin    │
    │   App    │ │   App    │ │  App      │
    └──────────┘ └──────────┘ └───────────┘
```

---

## INSTALLATION GUIDE

### Prerequisites
- Node.js 18.0.0+
- npm 9.0.0+
- PHP 8.1+
- PostgreSQL 12.0+ or MySQL 5.7+
- Git

### Frontend Installation (React Native)

#### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/delivery-app.git
cd delivery-app
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Install Pods (iOS only)
```bash
cd ios
pod install
cd ..
```

#### Step 4: Configure Environment Variables
Create `.env` file in root directory:
```bash
BACKEND_URL=http://your-backend-url
FIREBASE_CONFIG_ANDROID=<your-firebase-config>
FIREBASE_CONFIG_IOS=<your-firebase-config>
STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
GOOGLE_MAPS_API_KEY=<your-google-maps-key>
```

#### Step 5: Run on Android
```bash
npm run android
# or
npx react-native run-android
```

#### Step 6: Run on iOS
```bash
npm run ios
# or
npx react-native run-ios
```

### Backend Installation (Symfony)

#### Step 1: Clone Backend Repository
```bash
git clone https://github.com/yourusername/delivery-backend.git
cd delivery-backend
```

#### Step 2: Install Composer Dependencies
```bash
composer install
```

#### Step 3: Install Ratchet for WebSockets
```bash
composer require cboden/ratchet
```

#### Step 4: Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL=postgresql://user:password@localhost/delivery_db
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_MAPS_API_KEY=your-api-key
```

#### Step 5: Create Database
```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

#### Step 6: Load Fixtures (Optional - Test Data)
```bash
php bin/console doctrine:fixtures:load
```

#### Step 7: Start PHP Development Server
```bash
symfony server:start
# Server runs on http://localhost:8000
```

#### Step 8: Start WebSocket Server (New Terminal)
```bash
php bin/websocket-server.php
# Server runs on ws://localhost:8080
```

---

## CONFIGURATION & SETUP

### Firebase Setup

#### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project"
3. Enter project name
4. Enable Google Analytics (optional)
5. Click "Create"

#### 2. Get Firebase Credentials
1. Go to Project Settings (gear icon)
2. Under "Service Accounts" tab
3. Click "Generate New Private Key"
4. Download JSON file - keep this secure!

#### 3. Configure Android App
1. In Firebase Console, add Android app
2. Download `google-services.json`
3. Place in `android/app/`
4. Update `buildscript` in `android/build.gradle`

#### 4. Configure iOS App
1. In Firebase Console, add iOS app
2. Download `GoogleService-Info.plist`
3. Place in Xcode project root
4. Add to Target's Build Phases

### Stripe Setup

#### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up and verify email
3. Complete business verification

#### 2. Get API Keys
1. Go to Dashboard → Developers → API Keys
2. Copy:
   - **Publishable Key** (for frontend)
   - **Secret Key** (for backend)

#### 3. Configure Frontend
```bash
# In .env
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 4. Configure Backend
```bash
# In .env
STRIPE_SECRET_KEY=sk_test_...
```

#### 5. Test Payments
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

### Google Maps Setup

#### 1. Enable API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Maps SDK for iOS/Android
4. Enable Maps JavaScript API
5. Enable Directions API

#### 2. Create API Key
1. Go to Credentials
2. Click "Create Credentials" → "API Key"
3. Restrict to Android/iOS apps
4. Add package names:
   - Android: `com.deliveryapp`
   - iOS: `com.deliveryapp`

#### 3. Add to Project
```bash
# In .env
GOOGLE_MAPS_API_KEY=AIzaSyD...
```

---

## API DOCUMENTATION

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["ROLE_CUSTOMER"]
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+63912345678",
  "role": "ROLE_CUSTOMER"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": { ... }
}
```

### Products

#### Get All Products
```http
GET /api/products?page=1&limit=20&category=electronics
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "price": 1299.99,
      "stock": 50,
      "category": "electronics",
      "image": "url",
      "rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### Get Product Details
```http
GET /api/products/{id}
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "name": "Product Name",
  "description": "Full description",
  "price": 1299.99,
  "stock": 50,
  "category": "electronics",
  "images": ["url1", "url2"],
  "specifications": { ... },
  "reviews": [ ... ],
  "rating": 4.5
}
```

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 1299.99
    }
  ],
  "deliveryAddress": "123 Main St, City, Zip",
  "notes": "Handle with care"
}

Response: 201 Created
{
  "id": 1001,
  "orderNumber": "ORD-2041",
  "status": "pending",
  "total": 2699.98,
  "createdAt": "2026-05-26T10:30:00Z"
}
```

#### Get Orders
```http
GET /api/orders?status=completed&page=1
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": 1001,
      "orderNumber": "ORD-2041",
      "status": "completed",
      "items": [ ... ],
      "total": 2699.98,
      "createdAt": "2026-05-26T10:30:00Z"
    }
  ]
}
```

### Payments

#### Process Payment
```http
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": 1001,
  "stripeToken": "tok_visa",
  "amount": 2699.98
}

Response:
{
  "paymentId": "pay_123456",
  "orderId": 1001,
  "status": "succeeded",
  "amount": 2699.98,
  "createdAt": "2026-05-26T10:31:00Z"
}
```

### Messages

#### Send Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipientId": 123,
  "text": "Your order is on the way!",
  "orderId": 1001
}

Response: 201 Created
{
  "id": 5001,
  "senderId": 1,
  "recipientId": 123,
  "text": "Your order is on the way!",
  "timestamp": "2026-05-26T10:32:00Z",
  "seen": false
}
```

---

## WEBSOCKET IMPLEMENTATION

### Connection

#### Client Connect (React Native)
```typescript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    userId: '123',
    token: 'jwt_token_here'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle message
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### Message Types

#### 1. Chat Message
```json
{
  "type": "message",
  "senderId": "1",
  "senderName": "John",
  "recipientId": "123",
  "text": "Hello!",
  "timestamp": "2026-05-26T10:33:00Z"
}
```

#### 2. Typing Indicator
```json
{
  "type": "typing",
  "senderId": "1",
  "senderName": "John",
  "recipientId": "123"
}
```

#### 3. Delivery Status Update
```json
{
  "type": "deliveryStatus",
  "orderId": "ORD-2041",
  "status": "out_for_delivery",
  "location": {
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "eta": "15 mins"
}
```

#### 4. Location Update
```json
{
  "type": "locationUpdate",
  "userId": "rider_123",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "accuracy": 10,
  "timestamp": "2026-05-26T10:34:00Z"
}
```

---

## DATABASE SCHEMA

### Key Tables

#### Users Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  roles JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

#### Products Table
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  category VARCHAR(100),
  image_url VARCHAR(255),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT NOT NULL,
  status VARCHAR(50),
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  recipient_id BIGINT NOT NULL,
  text TEXT NOT NULL,
  order_id BIGINT,
  seen BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## DEPLOYMENT

### Deploy to Google Cloud Run (Recommended)

#### Step 1: Create Dockerfile
```dockerfile
FROM php:8.1-fpm

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql

# Copy application
COPY . .

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Build Symfony
RUN php bin/console cache:warmup --env=prod

EXPOSE 8000

CMD ["php", "bin/console", "server:run", "0.0.0.0:8000"]
```

#### Step 2: Build & Push Docker Image
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/delivery-api
```

#### Step 3: Deploy to Cloud Run
```bash
gcloud run deploy delivery-api \
  --image gcr.io/PROJECT_ID/delivery-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=postgresql://...
```

### Deploy WebSocket Server

#### Option 1: Cloud Compute Engine
1. Create VM instance
2. Install PHP & Ratchet
3. Start WebSocket server with Supervisor

#### Option 2: Docker + Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: websocket-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: websocket
  template:
    metadata:
      labels:
        app: websocket
    spec:
      containers:
      - name: websocket
        image: gcr.io/PROJECT_ID/websocket-server
        ports:
        - containerPort: 8080
```

---

## TROUBLESHOOTING

### Backend Won't Start
```bash
# Check logs
symfony server:start -v

# Clear cache
php bin/console cache:clear

# Check database connection
php bin/console doctrine:database:create
```

### WebSocket Connection Failing
```bash
# Check Ratchet server is running
lsof -i :8080

# Check firewall
sudo ufw allow 8080

# Check logs
tail -f /var/log/websocket.log
```

### Database Connection Issues
```bash
# Test connection
php bin/console doctrine:database:create

# Run migrations
php bin/console doctrine:migrations:migrate

# Check credentials in .env
cat .env | grep DATABASE_URL
```

---

**Version**: 1.0  
**Last Updated**: May 2026  
**Maintained By**: Development Team
