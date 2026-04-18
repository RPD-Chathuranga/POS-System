# ⚡ PlanWeb Solutions — Full-Stack Point of Sale System

A production-quality, portfolio-ready POS system built with React + Node.js + MongoDB.

![PlanWeb Solutions Preview](https://via.placeholder.com/1200x630/0f172a/0ea5e9?text=PlanWeb+Solutions+POS+System)

---

## 🏗️ Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18 + Vite, Tailwind CSS, Framer Motion      |
| Backend    | Node.js + Express.js                              |
| Database   | MongoDB + Mongoose                                |
| Auth       | JWT (JSON Web Tokens)                             |
| Charts     | Recharts                                          |
| Print      | react-to-print                                    |
| Icons      | Lucide React                                      |
| Toasts     | React Hot Toast                                   |

---

## ✨ Features

### 🔐 Authentication
- Admin & Cashier roles
- JWT-protected routes
- Persistent session via localStorage

### 📊 Dashboard
- Today's revenue, transactions, items sold
- Revenue vs yesterday comparison
- 7-day revenue area chart
- Payment method pie chart
- Top 5 products by revenue
- Low stock alert banner
- Recent transactions list

### 🛒 POS / Sales Screen
- **Barcode scanner input** — auto-focused, Enter triggers scan
- Real-time product lookup by barcode
- Product search with instant results (grid/list view)
- Animated scan confirmation with beep sound
- Duplicate scan → increases quantity automatically
- Cart with qty controls (+/−), remove items, clear cart
- Discount ($) and Tax (%) fields
- Live totals calculation

### 💳 Checkout
- Cash / Card / Mobile payment selection
- Cash amount input with quick-fill buttons
- Auto-calculated change
- Sale saved to database with stock deduction
- Transaction prevents overselling (stock check)

### 🧾 Receipt System
- Auto-generated receipt number (RCP-YYYYMMDD-XXXX)
- 80mm thermal printer-ready layout
- Simulated barcode graphic
- Print button via react-to-print
- View receipt inline after checkout

### 📦 Product Management
- Add / Edit / Delete products (soft delete)
- Fields: name, barcode, price, stock, category, unit, threshold
- Search, filter by low stock / out of stock
- Barcode duplicate detection

### 🏭 Inventory Management
- Stock level visualization with animated bars
- Color-coded status (green / amber / red)
- One-click stock adjustment modal
- Out-of-stock alert banner
- Filter by health status

### 📈 Sales History
- Paginated transaction table
- Filter by date range and payment method
- Sale detail modal with full breakdown
- Cash received / change given display

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd pos-system

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
# backend/.env (already created, edit as needed)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pos_system
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

### 3. Seed the Database
```bash
cd backend
npm run seed
```
This creates:
- **Admin user**: `admin@posystem.com` / `admin123`
- **Cashier**: `cashier@posystem.com` / `cashier123`
- **15 sample products** across categories
- **7 days of sample sales** for dashboard charts

### 4. Start the Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → Running on http://localhost:5173
```

### 5. Open the App
Visit **http://localhost:5173** and log in with the demo credentials.

---

## 📁 Project Structure

```
pos-system/
├── backend/
│   ├── config/
│   │   └── seed.js               # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Sale.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── salesRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── pos/
    │   │   │   ├── CartPanel.jsx
    │   │   │   └── CheckoutModal.jsx
    │   │   ├── products/
    │   │   │   └── ProductFormModal.jsx
    │   │   ├── receipt/
    │   │   │   └── Receipt.jsx
    │   │   └── ui/
    │   │       ├── Components.jsx   # Shared UI (Modal, StatCard, etc.)
    │   │       ├── Header.jsx
    │   │       ├── Layout.jsx
    │   │       └── Sidebar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── CartContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── POSPage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── SalesPage.jsx
    │   │   └── InventoryPage.jsx
    │   ├── utils/
    │   │   ├── api.js               # Axios instance + interceptors
    │   │   └── formatters.js        # Currency, date helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/login    | Login              |
| POST   | /api/auth/register | Register user      |
| GET    | /api/auth/me       | Get current user   |

### Products
| Method | Endpoint                        | Description             |
|--------|---------------------------------|-------------------------|
| GET    | /api/products                   | List all products       |
| GET    | /api/products/barcode/:barcode  | Find by barcode         |
| GET    | /api/products/low-stock         | Low stock products      |
| POST   | /api/products                   | Create product          |
| PUT    | /api/products/:id               | Update product          |
| DELETE | /api/products/:id               | Soft delete product     |

### Sales
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /api/sales                  | List sales (paginated)|
| POST   | /api/sales                  | Create sale           |
| GET    | /api/sales/:id              | Get single sale       |
| GET    | /api/sales/analytics        | Analytics data        |

### Dashboard
| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| GET    | /api/dashboard/stats   | All dashboard stats   |

---

## 🎯 POS Barcode Scanner Usage

The system works with any USB barcode scanner (HID keyboard emulation):

1. Open the **Point of Sale** screen
2. Click the barcode field (it auto-focuses on load)
3. Scan any barcode — the scanner sends keystrokes ending in Enter
4. The product is instantly added to the cart
5. Scan the same item again → quantity increases
6. Use **Search** button to browse/add products manually

**Test barcodes from seed data:**
- `5000112637922` — Coca-Cola 330ml
- `0028400090100` — Lays Classic Chips
- `7622210100887` — Oreo Cookies
- `9002490100070` — Red Bull (low stock)
- `4011445070029` — Tropicana OJ (out of stock)

---

## 🖨️ Receipt Printing

The receipt is designed for **80mm thermal printers** (standard POS receipt paper):
- After checkout, click **Print Receipt**
- Browser print dialog opens
- Set paper size to 80mm × auto
- Disable headers/footers in browser print settings
- Works with EPSON, Star, Bixolon and all ESC/POS printers

---

## 🌙 Theme Support

Toggle between **Dark** and **Light** themes using the sun/moon icon in the header. Theme preference is saved to localStorage.

---

## 🔒 Security Notes

For production deployment:
1. Change `JWT_SECRET` to a strong random string (32+ chars)
2. Use MongoDB Atlas with authentication
3. Set `NODE_ENV=production`
4. Add rate limiting to API routes
5. Implement HTTPS
6. Add input sanitization middleware

---

## 📝 License

MIT — Free for personal and commercial use.

---

Built with ❤️ using React + Node.js + MongoDB
