# Data Flow Diagram - Level 1 (Context Diagram)

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                      ╔═══════════════════════════════╗                      │
│                      ║    DELIVERY MANAGEMENT APP    ║                      │
│                      ║   (React Native Mobile)       ║                      │
│                      ╚═══════════════════════════════╝                      │
│                                                                             │
│    ┌──────────────────┐         ┌──────────────────┐    ┌──────────────┐   │
│    │   CUSTOMERS      │         │   RIDERS/STAFF   │    │    ADMIN     │   │
│    │  (Users buying   │         │ (Delivery       │    │ (Management) │   │
│    │   products)      │         │  personnel)     │    │              │   │
│    └────────┬─────────┘         └────────┬─────────┘    └──────┬───────┘   │
│             │                           │                     │            │
│             │ 1. Browse & Purchase      │ 2. Deliver Orders  │ 3. Monitor │
│             │    Products               │    & Chat          │    System  │
│             │ 2. Track Orders           │ 3. Real-time       │ 4. Manage  │
│             │ 3. Chat with Riders       │    Location        │    Users   │
│             │ 4. Receive Notifications  │ 4. Chat with       │ 5. Generate│
│             │                           │    Customers       │    Reports │
│             │                           │ 5. Update Status   │            │
│             └───────────────┬───────────┴────────┬──────────┴────────┐    │
│                             │                    │                  │    │
│                    ┌────────▼────────────────────▼──────────────────▼──┐  │
│                    │                                                    │  │
│                    │    ╔══════════════════════════════════════╗       │  │
│                    │    ║   BACKEND SYSTEM (Symfony PHP)      ║       │  │
│                    │    ║                                      ║       │  │
│                    │    ║  • REST API Endpoints               ║       │  │
│                    │    ║  • WebSocket Server (Ratchet)       ║       │  │
│                    │    ║  • Authentication (JWT)             ║       │  │
│                    │    ║  • Business Logic                   ║       │  │
│                    │    ╚══════════════════════════════════════╝       │  │
│                    │                                                    │  │
│                    │    ┌─────────────────────────────────────┐        │  │
│                    │    │    DATABASE (PostgreSQL/MySQL)      │        │  │
│                    │    │  • Users & Roles                    │        │  │
│                    │    │  • Products & Inventory             │        │  │
│                    │    │  • Orders & Deliveries              │        │  │
│                    │    │  • Messages & Chat History          │        │  │
│                    │    │  • Payments (Stripe)                │        │  │
│                    │    └─────────────────────────────────────┘        │  │
│                    │                                                    │  │
│                    └────────────────────────────────────────────────────┘  │
│                                      │                                    │
│                    ┌─────────────────┼──────────────────────┐             │
│                    │                 │                      │             │
│              ┌─────▼────┐    ┌──────▼────────┐    ┌────────▼────┐       │
│              │ Firebase  │    │  Stripe API   │    │ Google Maps │       │
│              │ (Push     │    │  (Payments &  │    │ (Location & │       │
│              │ Notif.)   │    │  Billing)     │    │  Routes)    │       │
│              └───────────┘    └───────────────┘    └─────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Description

### **1. Customer Flow**
```
Customer → Mobile App → REST API → Backend Processing → Database
    ↓
Browse Products → View Details → Add to Cart → Checkout → Payment (Stripe)
    ↓
Order Confirmation → Push Notification → Track Delivery → Real-time Chat
    ↓
Delivery Status Updates ← WebSocket ← Backend ← Database
```

### **2. Rider/Staff Flow**
```
Rider → Mobile App → Authentication (JWT) → Backend
    ↓
View Assigned Deliveries → Pick up Order → Update Status
    ↓
Real-time Chat ↔ WebSocket ↔ Customer Chat
    ↓
Location Tracking → Live Location Update → Customer sees ETA
    ↓
Delivery Complete → Confirmation → Database
```

### **3. Admin Flow**
```
Admin → Web/Mobile App → Authentication (JWT) → Backend
    ↓
View All Orders → Manage Users → Monitor Deliveries → Generate Reports
    ↓
Chat with Customers/Staff → Send System Messages
    ↓
Update System Settings → Manage Inventory → View Analytics
```

---

## External Integrations

### **Firebase Cloud Messaging**
```
Backend → Firebase API → Push Notification → Mobile Device
```
- Used for: Order updates, delivery notifications, urgent messages

### **Stripe Payment Gateway**
```
Customer → Payment Form → Stripe API → Bank Processing
    ↓
Stripe Webhook → Backend → Order Confirmation → Database
```
- Handles: Payment processing, billing, refunds

### **Google Maps API**
```
Rider Location → Backend → Google Maps → Route Optimization
    ↓
ETA Calculation → Customer Display
```
- Used for: Route planning, ETA estimation, delivery tracking

---

## Real-time Communication (WebSocket)

```
Customer                          Rider
    │                              │
    │        Connect to WS         │
    ├──────────────────────────────┤
    │                              │
    │   Sends: "Hi, where are you?"│
    ├─────────Message──────────────►
    │                         Display
    │                              │
    │                  Sends: "5 min away"
    │◄─────────Message──────────────┤
    │        Display
    │                              │
    │  Sends: Typing indicator ────►
    │                        Display
    │                              │
    └──────Repeat messages──────────┘
```

---

## Key Data Entities & Their Relationships

```
Users (id, email, name, role)
    ├── ROLE_CUSTOMER
    ├── ROLE_STAFF (Riders)
    └── ROLE_ADMIN

Orders (id, customer_id, status, total_amount, created_at)
    ├── Order Items (id, order_id, product_id, quantity)
    └── Deliveries (id, order_id, rider_id, status, location)

Messages (id, sender_id, recipient_id, text, created_at)
    └── Message Attachments (id, message_id, file_url)

Products (id, name, price, inventory)

Payments (id, order_id, stripe_transaction_id, status)
```

---

## System Interactions Timeline

```
T+0s    → Customer places order
T+1s    → Payment processed (Stripe)
T+2s    → Order confirmed in database
T+3s    → Push notification sent (Firebase)
T+5s    → Rider assigned
T+10s   → Rider receives notification
T+15s   → Rider accepts delivery
T+20s   → Real-time chat initiated (WebSocket)
T+25m   → Rider picks up order
T+45m   → Rider at delivery location
T+50m   → Delivery complete
T+51s   → Customer receives confirmation
```

---

## Security Data Flow

```
Mobile App → HTTPS → Backend Server
                ↓
         JWT Token Validation
                ↓
         Role-based Access Control
                ↓
         Database with Encryption
                ↓
         Secure WebSocket (WSS)
```
