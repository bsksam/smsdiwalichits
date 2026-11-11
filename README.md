# 🪔 DIWALI CHIT
## Supermarket Chit Fund Management ERP & Mobile Application

**DIWALI CHIT** is an enterprise-grade, production-ready Supermarket Chit Fund Management ERP designed specifically for Indian supermarkets and retail provision stores running festival savings schemes (தீபாவளி மளிகை சேமிப்புத் திட்டம்).

The software is dual-purpose:
1. **Responsive Web Application & Admin Management Dashboard** (Next.js 14, React 18, Tailwind CSS, libSQL/Turso SQLite, Drizzle ORM).
2. **Native Android Application** (`com.diwalichit.app`) powered by Capacitor with camera, receipt printing, and back-button navigation.

---

## 🌟 Key Features & Modules

### 1. Festive Branding & Bilingual UI
- **Theme:** Royal Blue (`#1e3a8a`), Golden Yellow (`#f59e0b`), Deep Festive Red (`#b91c1c`), White and Light Cream backgrounds (`#fffbeb`).
- **Bilingual Interface:** Instant seamless switching between **Tamil (தமிழ்)** and **English** with persistent user preference.
- **Indian Formats:** Currency in Indian Rupees (`₹`), Dates in `DD-MM-YYYY`.
- **Royal Diya Brand Logo:** Vector SVG emblem with glowing flame and supermarket motifs.

### 2. Main Executive Dashboard
- **10 Core Live Metric Cards:**
  - Total Customers
  - Active Members
  - Total Running Schemes
  - Today's Verified Collection
  - Monthly Collection
  - Pending Installments & Outstanding Balance
  - Overdue Defaulter Payments
  - Completed Schemes Ready for Redemption
  - Upcoming 60-Day Maturity Tracking
  - Supermarket Grocery Stock Valuation
- **Interactive Charts:**
  - Monthly Collection Trend (Bar Chart)
  - Scheme-wise Share & Distribution (Donut / Pie Chart)
- **Quick Action Bar:** One-click Quick Payment modal available globally from the header.
- **WhatsApp Reminders:** Instant 1-click click-to-chat reminders for members with pending dues.
- **Real-Time Audit Trail:** Live feed of financial events and staff actions.

### 3. Customer Management
- Auto-generated customer codes: `DC-2026-0001`.
- Complete fields: Name, Father/Husband name, Mobile, Alternate Mobile, Address, City, District, Pincode, Aadhaar last-4 ref, Nominee details.
- Comprehensive Customer Ledger, Enrolled Schemes, Payment History, and One-Click Member Card / Passbook Generation.
- Excel Export (`.xlsx`) of customer directory.

### 4. Scheme Management
- Unlimited customizable chit schemes:
  - **₹700 Scheme:** ₹700 x 12 months = ₹8,400 + Bonus = ₹10,000 Grocery Hamper.
  - **₹1,000 Scheme:** ₹1,000 x 12 months = ₹12,000 + Bonus = ₹14,500 Grocery Hamper.
  - **₹1,500 Scheme:** ₹1,500 x 12 months = ₹18,000 + Bonus = ₹22,000 Grocery Hamper.
- Flexible monthly amounts, durations (10/12 months), due day (e.g. 10th of every month), joining fees, bonus percentages, and terms in Tamil & English.

### 5. Installment Tracking & Duplicate Prevention
- Automatic generation of 12-month installment schedules with calculated due dates upon member enrollment.
- Statuses: `Paid`, `Pending`, `Partial`, `Overdue`, `Advance`.
- Strict duplicate payment prevention.
- Printable Monthly Collection Sheets.

### 6. Payment Collection & Thermal Receipts
- Automatic Receipt numbering: `RCP-2026-00001`.
- Modes: Cash, UPI (GPay/PhonePe), Bank Transfer, Card.
- Instant thermal (80mm) and standard receipt preview and printing.
- WhatsApp receipt sharing with pre-formatted bilingual message.
- **Transaction Reversal with Audit Trail:** Authorized reversal with mandatory detailed reason and automatic ledger recalculation.

### 7. Supermarket Grocery Item Inventory
- Pre-seeded with 20 authentic Tamil festival groceries:
  1. Turmeric Powder (மஞ்சள் தூள்) – 50g
  2. Deluxe Ponni Boiled Rice (பொன்னி புழுங்கல் அரிசி) – 10kg
  3. Urad Dal White (உளுத்தம் பருப்பு) – 2kg
  4. Premium Toor Dal (துவரம் பருப்பு) – 2kg
  5. Moong Dal (பாசிப் பருப்பு) – 1kg
  6. Chana Dal (கடலைப் பருப்பு) – 1kg
  7. Roasted Rava (ரவை) – 1kg
  8. Besan Flour (கடலை மாவு) – 1kg
  9. Gulab Jamun Mix (குலாப் ஜாமூன் மிக்ஸ்) – 2 packets
  10. Bajji Bonda Mix (பஜ்ஜி போண்டா மிக்ஸ்) – 2 packets
  11. Refined Maida (மைதா மாவு) – 500g
  12. Idiyappam / Rice Flour (அரிசி மாவு) – 500g
  13. Pure Ragi Flour (ராகி மாவு) – 500g
  14. Seedless Tamarind (புளி) – 500g
  15. Refined Sunflower Cooking Oil (சமையல் எண்ணெய்) – 2 litres
  16. Cold Pressed Groundnut Oil (கடலை எண்ணெய்) – 1 litre
  17. Pure Crystal Salt (கல் உப்பு) – 2kg
  18. Chakki Fresh Wheat Flour (கோதுமை மாவு) – 5kg
  19. Pure White Sugar (சர்க்கரை) – 3kg
  20. Diwali Special Sweet Box (தீபாவளி இனிப்பு பாக்ஸ்) – 500g
- Stock tracking and low-stock alerts.

### 8. Grocery Package Builder & Redemptions
- Visual Package Builder: Combine unlimited groceries, set unit prices, apply festival bonus.
- Redemption verification: Ensures installments are paid prior to issuance.
- Automatic stock deduction when goods are issued.
- Detailed snapshot of delivered products with customer acknowledgement.
- Legal rule enforcement: Cash payouts allowed only if scheme explicitly permits.

### 9. A4 Tamil Supermarket Chit Poster Generator
- Modeled exactly on the traditional Tamil Supermarket Chit poster format:
  - **Left Section:** Monthly installment amount, payment rules, early-bird lucky draw gifts, terms in Tamil.
  - **Right Section:** Structured grocery products table with Tamil names, English names, and exact quantities.
  - **Bottom Section:** Total contribution value, grocery package value, bonus savings highlight, supermarket name, address, and phone numbers.
- **Interactive Live Preview** with editable fields from admin.
- Export as **Printable A4 (210mm x 297mm)**, **High-Resolution PNG**, or **PDF**.
- Direct WhatsApp sharing link.

### 10. Expenses & Cash Book
- Daily expense vouchers, categories (Rent, Printing, Salaries, Packaging).
- Cash Book: Real-time calculation of Inflow (Collections) vs Outflow (Expenses) = Net Cash on Hand.

### 11. Reports & Analytics
- Daily Collection, Monthly Collection, Scheme-wise, Pending, Overdue, Redemptions, Inventory Valuation, and Profit & Loss Summary.
- Export to Excel (`.xlsx`) or Print.

### 12. Security & Role-Based Permissions
- Roles: `Super Admin`, `Admin`, `Manager`, `Cashier`, `Collection Agent`, `Viewer`.
- Passwords hashed with bcrypt (salt factor 10).
- HTTP-only signed JWT session cookies.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2 (App Router) with TypeScript |
| **Styling** | Tailwind CSS with custom royal palette |
| **Icons** | Lucide React |
| **Charts** | Recharts (Responsive SVG) |
| **Database** | SQLite / libSQL with Drizzle ORM |
| **Cloud DB** | Turso (Hosted libSQL serverless SQLite) |
| **Exports** | XLSX (Excel), jsPDF, html2canvas (PNG/PDF) |
| **Mobile** | Capacitor 6 (Android native project `com.diwalichit.app`) |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js v18 or v20+
- Java 17 LTS (for Android APK generation)
- Android SDK installed (`ANDROID_HOME` configured)

### 2. Installation
```bash
git clone <repository-url>
cd diwali-chit
npm install
```

### 3. Initialize Database & Seed
```bash
# Runs SQLite migrations and seeds authentic Tamil supermarket data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Default Credentials
| Role | Username | Password |
|---|---|---|
| **Super Admin** | `admin` | `admin123` |
| **Manager** | `manager` | `staff123` |
| **Cashier** | `cashier` | `staff123` |
| **Collection Agent** | `agent1` | `staff123` |

---

## ☁️ Vercel & Turso Production Deployment

### 1. Create Turso Database
1. Install Turso CLI or log in at [turso.tech](https://turso.tech).
2. Create a new database:
   ```bash
   turso db create diwali-chit-prod
   ```
3. Get the database URL and authentication token:
   ```bash
   turso db show diwali-chit-prod --url
   turso db tokens create diwali-chit-prod
   ```

### 2. Configure Environment Variables in Vercel
In your Vercel Project Settings -> Environment Variables, add:
```env
TURSO_DATABASE_URL=libsql://diwali-chit-prod-[your-org].turso.io
TURSO_AUTH_TOKEN=your-generated-turso-token
JWT_SECRET=super_secure_jwt_secret_diwali_chit_2026
NEXT_PUBLIC_APP_NAME="DIWALI CHIT"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### 3. Run Remote Migrations & Seed
```bash
# Push schema to Turso
TURSO_DATABASE_URL="libsql://diwali-chit-prod-[your-org].turso.io" TURSO_AUTH_TOKEN="your-token" npx tsx src/db/seed.ts
```

### 4. Deploy
Push to GitHub and connect to Vercel. Builds with standard `npm run build`.

---

## 📱 Android APK Generation (Capacitor)

The native Android project is configured under `android/` with package name `com.diwalichit.app`.

### Build Workflow:
```bash
# 1. Build web assets
npm run build

# 2. Sync web assets to native Android project
npx cap sync android

# 3. Open in Android Studio (Optional)
npx cap open android

# 4. Generate Debug APK directly with Gradle:
cd android
./gradlew assembleDebug
```

### APK Output Location:
- **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Generating Signed Release APK / AAB:
1. Generate keystore:
   ```bash
   keytool -genkey -v -keystore diwali-chit.keystore -alias diwalichit -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Build Release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. The release APK will be located at `android/app/build/outputs/apk/release/app-release-unsigned.apk`.

---

## 📄 License
Commercial Supermarket Chit ERP Software. Developed for Sri Lakshmi Supermarket. All rights reserved.
