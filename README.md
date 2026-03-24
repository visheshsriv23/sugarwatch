# 🍬 SugarWatch — Full-Stack Node.js App

India's #1 Sugar Tracker. Built with Node.js, Express, MongoDB, EJS, and Passport.js.

---

## 📁 Project Structure

```
sugarwatch/
├── config/
│   ├── db.js              # MongoDB connection
│   └── passport.js        # Passport local strategy
├── middleware/
│   └── auth.js            # ensureAuth, ensureGuest, setLocals
├── models/
│   ├── User.js            # User schema + bcrypt
│   ├── Product.js         # Product schema + virtuals
│   └── FoodLog.js         # Food log schema
├── routes/
│   ├── auth.js            # /auth/login, /signup, /logout
│   ├── dashboard.js       # /dashboard
│   ├── scan.js            # /scan
│   ├── products.js        # /products
│   └── profile.js         # /profile
├── views/
│   ├── layouts/
│   │   ├── main.ejs       # Sidebar layout (authenticated)
│   │   ├── auth.ejs       # Auth pages layout
│   │   └── landing.ejs    # Landing page layout
│   ├── auth/
│   │   ├── login.ejs
│   │   └── signup.ejs
│   ├── dashboard/
│   │   └── index.ejs
│   ├── scan/
│   │   └── index.ejs
│   ├── products/
│   │   ├── index.ejs
│   │   └── detail.ejs
│   ├── profile/
│   │   ├── index.ejs
│   │   └── history.ejs
│   ├── home.ejs           # Landing page
│   ├── 404.ejs
│   └── error.ejs
├── public/
│   ├── css/style.css
│   └── js/app.js
├── server.js              # Main entry point
├── seed.js                # Database seeder
├── .env                   # Environment variables (gitignored)
├── .env.example           # Template
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 2. Install dependencies
```bash
cd sugarwatch
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and session secret
```

### 4. Seed the database
```bash
node seed.js
```
This creates 25 Indian products and a demo account.

### 5. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```
### 🐳 Run with Docker
```bash
docker build -t sugarwatch .
docker run -p 3000:3000 --env-file .env sugarwatch
```
### 6. Open in browser
`

http://localhost:3000
```

**Demo account:**
- Email: `demo@sugarwatch.in`
- Password: `demo123`

---

## 🔐 Security Features

| Feature | Package | Details |
|---|---|---|
| Helmet | `helmet` | Sets 14 HTTP security headers |
| Rate limiting | `express-rate-limit` | 20 req/15min on auth routes |
| MongoDB sanitization | `express-mongo-sanitize` | Prevents NoSQL injection |
| Password hashing | `bcryptjs` | Salt rounds: 10 |
| Session security | `express-session` | httpOnly, secure in prod, 7-day expiry |
| Input validation | `express-validator` | All form inputs validated |
| CSRF | Sessions + same-origin | Flash messages for all state changes |

---

## 📄 Pages & Routes

| Route | Auth | Description |
|---|---|---|
| `GET /` | Public | Landing page |
| `GET /auth/login` | Guest only | Login form |
| `POST /auth/login` | Guest only | Authenticate |
| `GET /auth/signup` | Guest only | Registration form |
| `POST /auth/signup` | Guest only | Create account |
| `GET /auth/logout` | Auth | Destroy session |
| `GET /dashboard` | Auth | Daily sugar dashboard |
| `DELETE /dashboard/log/:id` | Auth | Remove food log (AJAX) |
| `GET /scan` | Auth | Barcode scanner + manual form |
| `POST /scan/log` | Auth | Log a food item |
| `GET /scan/lookup?barcode=` | Auth | Lookup product by barcode (JSON) |
| `GET /products` | Auth | Browse/search product database |
| `GET /products/:id` | Auth | Product detail page |
| `GET /profile` | Auth | Profile + settings tabs |
| `POST /profile/update` | Auth | Update name/age/limit |
| `POST /profile/change-password` | Auth | Change password |
| `GET /profile/history` | Auth | Paginated food log history |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18 |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | Passport.js (Local Strategy) |
| Passwords | bcryptjs (salt 10) |
| Sessions | express-session + connect-mongo |
| Templates | EJS + express-ejs-layouts |
| Security | Helmet, mongo-sanitize, rate-limit, express-validator |
| Logging | Morgan |
| Frontend | Vanilla JS + custom CSS design system |

---

## 🌱 Environment Variables

```env
NODE_ENV=development        # development | production
PORT=3000
MONGO_URI=mongodb://...     # MongoDB connection string
SESSION_SECRET=...          # Min 32 chars, random string
APP_NAME=SugarWatch
APP_URL=http://localhost:3000
```

---

## 📦 Deploy to Production

1. Set `NODE_ENV=production` in `.env`
2. Use MongoDB Atlas for the database
3. Set a strong `SESSION_SECRET` (32+ chars)
4. Use a process manager: `pm2 start server.js`
5. Reverse proxy with Nginx

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name sugarwatch
pm2 save
pm2 startup
```
