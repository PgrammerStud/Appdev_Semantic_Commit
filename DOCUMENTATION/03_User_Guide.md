# USER GUIDE - Delivery Management App

## Table of Contents
1. [Getting Started](#getting-started)
2. [Customer Guide](#customer-guide)
3. [Rider/Staff Guide](#riderstaff-guide)
4. [Admin Guide](#admin-guide)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## GETTING STARTED

### Installation & Setup

#### Step 1: Download the App
1. Open your device's app store
   - **Android**: Google Play Store
   - **iOS**: Apple App Store
2. Search for "Delivery Management App" or scan the QR code
3. Tap **Install**
4. Wait for the download to complete

#### Step 2: Create an Account
1. Open the app
2. Tap **Sign Up**
3. Enter your details:
   - Full Name
   - Email Address
   - Phone Number
   - Password (minimum 8 characters)
   - Confirm Password
4. Select your role:
   - **Customer** (buying products)
   - **Rider/Staff** (delivering orders)
5. Tap **Create Account**
6. Check your email for verification link
7. Verify your email and return to app

#### Step 3: Log In
1. Enter your email
2. Enter your password
3. Tap **Log In**
4. Grant necessary permissions:
   - **Location**: For tracking deliveries
   - **Notifications**: For order/delivery updates
   - **Camera** (optional): For photo uploads

---

## CUSTOMER GUIDE

### Main Dashboard
```
┌─────────────────────────────┐
│   Welcome, [Your Name]!     │
│                             │
│  [Your Active Orders: 2]    │
│  [Notifications: 3]         │
│                             │
│  Quick Actions:             │
│  ├─ Browse Products         │
│  ├─ My Orders              │
│  ├─ Track Delivery         │
│  └─ Messages               │
└─────────────────────────────┘
```

### 1. Browsing & Purchasing Products

#### Browse Products:
1. Tap **Home** tab at bottom
2. Scroll through featured products
3. Use **Search bar** to find specific items
4. Use **Filter** for categories/price ranges
5. Tap product to see:
   - Full description
   - High-resolution images
   - Pricing
   - Customer reviews
   - Stock availability

#### Add to Cart:
1. Select quantity (use + and - buttons)
2. Choose any options (size, color, etc.)
3. Tap **Add to Cart**
4. Tap cart icon to review

#### View Cart:
1. Tap **Cart** icon (bottom right)
2. Review items and quantities
3. Edit quantities or remove items
4. See **Subtotal** and **Delivery Fee**
5. Tap **Proceed to Checkout**

#### Checkout Process:
1. Review delivery address
   - Edit if needed: tap **Change Address**
2. Select payment method:
   - **Credit/Debit Card**: Tap "Add Card"
   - **e-Wallet**: Select from available options
3. Review order summary
4. Tap **Pay Now**
5. Complete payment on Stripe screen
6. Order confirmation appears with:
   - Order number
   - Estimated delivery time
   - Rider assignment (when available)

### 2. Tracking Your Order

#### View Active Orders:
1. Tap **Orders** tab
2. View all your orders in chronological order
3. Each order shows:
   - Order number
   - Order date
   - Current status (badge with color)
   - Total amount

#### Track Live Delivery:
1. Open the order with **"Out for Delivery"** status
2. See delivery map with:
   - Rider's current location (pin icon)
   - Your delivery address (destination)
   - Estimated arrival time
   - Distance to destination

#### Order Details:
1. Tap any order to expand
2. View complete details:
   - Items ordered (with quantities)
   - Unit prices and total
   - Delivery address
   - Rider name and rating
   - Contact button to call rider
   - Chat option

### 3. Communicating with Riders

#### Send a Message:
1. From active order, tap **Chat** button
2. Type your message in the text field
3. Attach photos (optional): tap photo icon
4. Tap **Send** (paper airplane icon)
5. See message appear with timestamp

#### Receive Notifications:
- **Order Confirmed**: Instantly when payment succeeds
- **Rider Assigned**: When rider accepts delivery
- **Order Picked Up**: When rider picks up from store
- **On the Way**: When rider leaves for delivery
- **Arriving Soon**: 5 minutes before arrival
- **Delivered**: When order is complete

#### Typing Indicator:
- See "✓ Typing..." when rider is composing message
- Rider sees same indicator from you

### 4. Order Status Legend

| Status | Meaning | What to Do |
|--------|---------|-----------|
| **Pending** | Order received, payment processing | Wait for confirmation |
| **Confirmed** | Payment successful | Rider will be assigned soon |
| **Preparing** | Store is preparing order | Rider arriving to store soon |
| **Picked Up** | Rider has collected order | On the way to you |
| **Out for Delivery** | Rider on the way to you | Track location, prepare to receive |
| **Completed** | Order delivered successfully | Rate rider and product |
| **Cancelled** | Order cancelled | Refund being processed |

### 5. Managing Your Account

#### View Profile:
1. Tap **Profile** tab
2. View your information:
   - Name, email, phone
   - Profile picture
   - Account creation date
   - Total orders placed
   - Loyalty points/rewards (if applicable)

#### Edit Profile:
1. From profile screen, tap **Edit**
2. Update information you want to change
3. Tap **Save Changes**

#### Saved Addresses:
1. From profile, tap **Saved Addresses**
2. Add new address:
   - Tap **+Add Address**
   - Enter full address
   - Label it (Home, Work, etc.)
   - Set as default (optional)
3. Delete address: swipe left and tap trash icon

#### Payment Methods:
1. From profile, tap **Payment Methods**
2. Add new card:
   - Tap **+Add Card**
   - Enter card details via secure Stripe form
   - Set as default (optional)
3. Remove card: swipe left and tap trash icon

#### Settings:
1. From profile, tap **Settings**
2. Options include:
   - **Notifications**: Toggle push alerts
   - **Location**: Manage location sharing
   - **Preferences**: Dietary restrictions, etc.
   - **Privacy**: Data sharing options
   - **Language**: Change app language
   - **Support**: Contact support

### 6. Rating & Reviews

#### After Delivery:
1. You'll receive a rating prompt
2. Rate the order (1-5 stars):
   - 5 ⭐ Excellent
   - 4 ⭐ Good
   - 3 ⭐ Okay
   - 2 ⭐ Poor
   - 1 ⭐ Terrible
3. Write optional review (max 250 characters)
4. Rate the rider (1-5 stars) separately
5. Tap **Submit**

#### View Reviews:
1. Go to **Orders** → completed order
2. See your review and rating
3. Edit review: tap **Edit**
4. Delete review: tap **Delete**

---

## RIDER/STAFF GUIDE

### Main Dashboard
```
┌─────────────────────────────┐
│   Welcome, [Rider Name]!    │
│                             │
│  [Active Deliveries: 5]     │
│  [Today's Earnings: ₱850]   │
│  [Acceptance Rate: 98%]     │
│                             │
│  Quick Actions:             │
│  ├─ View Deliveries        │
│  ├─ Chat with Customers   │
│  ├─ Live Tracking         │
│  └─ Delivery History      │
└─────────────────────────────┘
```

### 1. Receiving & Accepting Deliveries

#### Notification Alert:
1. You'll receive a push notification:
   ```
   "New Delivery Available
    Order #ORD-2041
    Customer: John Garcia
    Distance: 2.3 km away"
   ```
2. Swipe notification to see full details
3. See on app:
   - Customer name and address
   - Order contents and value
   - Distance and estimated time
   - Acceptance timer (60 seconds)

#### Accept Delivery:
1. Tap **Accept** button
2. See order details:
   - Customer's full address
   - Order items and quantities
   - Special instructions (if any)
   - Customer's phone number
   - Chat button

#### Decline Delivery:
1. Tap **Decline**
2. Select reason (optional)
3. Order released to other riders

### 2. Managing Your Deliveries

#### View Delivery Queue:
1. Tap **Deliveries** tab
2. See active deliveries sorted by:
   - Priority (closest first)
   - Pickup status
3. Tap order to see full details
4. Swipe to see more options

#### Pickup from Store:
1. Navigate to store location using Google Maps
2. Arrive at store and tap **I'm Here**
3. Confirm pickup:
   - Verify order items with store
   - Check items match delivery list
   - Tap **Confirm Pickup**
4. See status update to "Picked Up"
5. Navigation to customer starts automatically

#### Update Delivery Status:

**On the Way:**
1. After pickup, tap **On the Way**
2. Confirm navigation to customer
3. Real-time location sharing starts

**Arriving:**
1. As you arrive, tap **I'm Here**
2. Notify customer (auto-message sent)
3. Wait for customer to come out

**Delivery Complete:**
1. Confirm delivery with customer
2. Take photo of delivered package (optional)
3. Tap **Mark Delivered**
4. Receive payment confirmation
5. Delivery moved to history

### 3. Real-time Chat with Customers

#### Start Chat:
1. From delivery details, tap **Chat** button
2. See conversation thread
3. View customer's previous messages

#### Send Message:
1. Type in message field
2. Tap **Send** button
3. Message appears with timestamp

#### Share Location:
1. While chatting, tap **Share Location**
2. Customer receives your current location
3. Shows distance and ETA

#### Send Photos:
1. Tap **Photo** icon
2. Choose from gallery or take new photo
3. Add optional caption
4. Tap **Send**

### 4. Earnings & Statistics

#### Today's View:
1. Tap **Earnings** tab
2. See:
   - Total deliveries today
   - Total distance traveled
   - Total earnings
   - Active delivery count
   - Estimated remaining earnings

#### Weekly/Monthly View:
1. Select time period (Week/Month)
2. See detailed breakdown:
   - Total trips completed
   - Average distance per trip
   - Average earnings per trip
   - Total earnings
   - Tips received
   - Rating average

#### Payment Details:
1. View in **Earnings** section
2. See payment schedule (weekly/bi-weekly)
3. Next payout date
4. Payment method linked
5. Transaction history

### 5. Route Optimization

#### Use Suggested Route:
1. After pickup, automatic route displays
2. Follow turn-by-turn directions
3. App shows:
   - Distance remaining
   - Estimated time to arrival
   - Current traffic status
4. Recalculate if traffic changes

#### Change Route:
1. Tap **Route Options**
2. See alternative routes:
   - Fastest route (usually selected)
   - Shortest distance route
   - Avoid highways option
3. Tap preferred route
4. Navigation updates

#### Multiple Deliveries:
1. When you have multiple orders:
   - App optimizes delivery sequence
   - Shows combined ETA
   - Check each delivery details
   - Complete one to move to next

### 6. Performance & Ratings

#### View Your Rating:
1. Go to **Profile** → **Ratings**
2. See average star rating (1-5)
3. View breakdown by:
   - On-time delivery rate
   - Item condition upon arrival
   - Professionalism/courtesy
   - Communication

#### Ratings History:
1. See all customer ratings
2. View individual reviews
3. See response rating to complaints

#### Improvement Tips:
- Maintain high on-time rate (>95%)
- Keep items in good condition
- Communicate proactively
- Be polite and professional
- Handle special requests well

---

## ADMIN GUIDE

### Admin Dashboard
```
┌──────────────────────────────┐
│      ADMIN DASHBOARD         │
│                              │
│  Statistics:                 │
│  ├─ Total Users: 15,234     │
│  ├─ Total Orders: 45,821    │
│  ├─ Active Riders: 342      │
│  ├─ Total Revenue: ₱2.3M    │
│                              │
│  Quick Actions:              │
│  ├─ Manage Users            │
│  ├─ View All Orders         │
│  ├─ Manage Inventory        │
│  ├─ Generate Reports        │
│  └─ System Messages         │
└──────────────────────────────┘
```

### 1. User Management

#### View All Users:
1. Tap **Users** → **All Users**
2. See user list with:
   - Name, email, role
   - Join date
   - Total orders/deliveries
   - Account status (Active/Suspended)

#### Filter Users:
- By role: Customers, Riders, Admins
- By status: Active, Suspended, Deleted
- By creation date
- By activity level

#### User Details:
1. Tap user in list
2. See detailed profile:
   - Full contact information
   - Order history
   - Total spent / earnings
   - Ratings and reviews
   - Account status

#### Manage User:
1. From user details, select action:
   - **View History**: See all activities
   - **Suspend Account**: Temporarily disable
   - **Reactivate**: Re-enable suspended
   - **Delete Account**: Permanently remove
   - **Send Message**: Direct communication

### 2. Order Management

#### View All Orders:
1. Tap **Orders** → **All Orders**
2. See complete order list with:
   - Order number
   - Customer name
   - Order date & time
   - Status
   - Total amount
   - Assigned rider

#### Filter Orders:
- By status (Pending, Confirmed, Preparing, Out for Delivery, etc.)
- By date range
- By customer
- By payment status

#### Order Details:
1. Tap order to view:
   - Customer info
   - Complete item list
   - Delivery address
   - Assigned rider
   - Chat history
   - Payment information
   - Any notes or complaints

#### Manage Order:
- **Reassign Rider**: Change delivery person
- **Cancel Order**: With/without refund
- **Update Status**: Manual status change (if needed)
- **View Chat**: See customer-rider communication
- **Generate Invoice**: For records

### 3. Inventory Management

#### View Products:
1. Tap **Inventory** → **Products**
2. See all products:
   - Product name & image
   - Current stock level
   - Reorder level
   - Price
   - Status (Active/Inactive)

#### Add New Product:
1. Tap **+ Add Product**
2. Fill in details:
   - Name
   - Description
   - Category
   - Price
   - Stock quantity
   - Images (upload)
   - Features/specifications
3. Set reorder level (when to alert)
4. Tap **Save**

#### Edit Product:
1. Tap product from list
2. Modify any field:
   - Price
   - Description
   - Stock quantity
   - Images
   - Status
3. Tap **Save Changes**

#### Low Stock Alert:
1. Dashboard shows red alert if stock below reorder level
2. Automatically notified via email
3. Quickly access to add inventory

### 4. Analytics & Reports

#### Sales Dashboard:
1. Tap **Reports** → **Sales**
2. View metrics:
   - Total sales (daily/weekly/monthly)
   - Average order value
   - Top products
   - Revenue by category
   - Peak ordering times

#### Rider Performance:
1. Tap **Reports** → **Rider Performance**
2. See metrics for each rider:
   - Deliveries completed
   - Average rating
   - On-time percentage
   - Total earnings
   - Trend chart

#### Customer Insights:
1. Tap **Reports** → **Customers**
2. View:
   - Total active customers
   - New customers (this period)
   - Repeat purchase rate
   - Average customer value
   - Customer retention

#### Generate Custom Report:
1. Tap **Reports** → **Custom Report**
2. Select parameters:
   - Date range
   - Metrics to include
   - Format (PDF, Excel, CSV)
3. Tap **Generate**
4. Download report

### 5. System Communications

#### Send System Message:
1. Tap **Messages** → **Broadcast**
2. Compose message:
   - Title
   - Message content
   - Select recipients (All/Riders/Customers/Specific user)
   - Schedule or send immediately
3. Tap **Send**

#### Chat with Users:
1. Tap **Messages** → **Conversations**
2. Select user to chat with
3. Send and receive messages
4. Can share files/documents

#### Announcements:
1. Tap **System** → **Announcements**
2. Create new announcement:
   - Title
   - Content
   - Display duration
   - Target audience
3. Publish
4. Appears on app homepage

### 6. Settings & Configuration

#### System Settings:
1. Tap **Settings** → **System**
2. Configure:
   - Platform name/logo
   - Default delivery fee
   - Tax rates
   - Operating hours
   - Payment options

#### Notification Settings:
1. Tap **Settings** → **Notifications**
2. Enable/disable alerts for:
   - New orders
   - Rider assignments
   - System issues
   - Payment confirmations

#### API Keys & Integration:
1. Tap **Settings** → **Integrations**
2. Manage:
   - Stripe API keys
   - Firebase credentials
   - Google Maps API
   - Other third-party services

---

## TROUBLESHOOTING

### Common Issues & Solutions

#### App Won't Open
**Problem**: App crashes on startup
**Solution**:
1. Force close the app (go to Settings → Apps → Force Stop)
2. Clear app cache (Settings → Apps → Storage → Clear Cache)
3. Restart your device
4. Re-open app
5. If still broken, uninstall and reinstall app

#### Can't Log In
**Problem**: Getting "Invalid credentials" error
**Solution**:
1. Verify email is correct
2. Check caps lock on password
3. Tap **Forgot Password** to reset
4. Check internet connection
5. Try logging in on another device

#### Notifications Not Working
**Problem**: Not receiving push notifications
**Solution**:
1. Check app permissions (Settings → Apps → Notifications → Toggle ON)
2. Check phone's Do Not Disturb settings
3. Go to app **Settings** → Enable Notifications
4. Restart app
5. Check: Settings → Notification Access → Enable app

#### Location Not Updating
**Problem**: Real-time location not showing
**Solution**:
1. Grant location permission (Settings → Apps → Location → Always Allow)
2. Ensure GPS is enabled on phone
3. Be in area with good GPS signal
4. Restart app
5. Close other location-based apps

#### Payment Failed
**Problem**: Payment declined during checkout
**Solution**:
1. Check internet connection
2. Verify card details are correct
3. Contact your bank (card may be blocked)
4. Try different payment method
5. Clear browser cache/cookies
6. Try on different device

#### Messages Not Syncing
**Problem**: Chat messages not appearing
**Solution**:
1. Check internet connection (use WiFi)
2. Refresh chat screen (pull down)
3. Restart app
4. Check if recipient is online
5. Try clearing app cache

#### Map Not Loading
**Problem**: Delivery tracking map won't load
**Solution**:
1. Turn on WiFi or cellular
2. Check Google Maps app is installed
3. Go to Settings → Apps → Permissions → Location (grant permission)
4. Clear Google Maps cache
5. Restart phone

---

## FAQ

**Q: How long does delivery take?**  
A: Usually 30-60 minutes from order confirmation, depending on distance and traffic.

**Q: Can I track my order in real-time?**  
A: Yes! Once status is "Out for Delivery," you can see rider's live location on map.

**Q: What if my order arrives damaged?**  
A: Contact support immediately with photos. We'll arrange replacement or refund.

**Q: How do riders get paid?**  
A: Riders receive payment weekly based on completed deliveries. Payment goes to linked bank account.

**Q: Can I cancel an order?**  
A: If order status is "Pending" or "Confirmed," yes. After "Picked Up," cancellation not allowed.

**Q: What payment methods are accepted?**  
A: Credit/Debit cards, e-wallets (GCash, PayMaya), and Bank transfers.

**Q: Is my personal information secure?**  
A: Yes! We use SSL/TLS encryption and never share your data with third parties.

**Q: What's the minimum order value?**  
A: Minimum order is usually ₱100, though this may vary.

**Q: Do you charge for delivery?**  
A: Yes, delivery fee is calculated based on distance. Check during checkout.

**Q: Can riders see my full address?**  
A: Yes, riders need your address to deliver. We keep this information secure.

**Q: What if the rider never arrives?**  
A: Contact support immediately. We'll locate the rider or cancel order and refund.

**Q: How do I become a rider?**  
A: Sign up with role as "Rider/Staff" and complete verification process.

**Q: Is there customer support?**  
A: Yes! Tap **Help** → **Contact Support** or email support@deliveryapp.com

---

**Last Updated**: May 2026  
**Version**: 1.0  
**Support Email**: support@deliveryapp.com  
**Support Phone**: 1-800-DELIVERY
