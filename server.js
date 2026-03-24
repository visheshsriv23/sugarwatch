require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const flash = require('connect-flash');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');
const { setLocals } = require('./middleware/auth');

const app = express();

// ── DATABASE ──────────────────────────────────
connectDB();

// ── SECURITY MIDDLEWARE ───────────────────────
// In app.js or server.js
// In app.js
// In your app.js
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src-attr": ["'unsafe-inline'"]
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        "img-src": ["'self'", "data:", "blob:"],
      },
    },
  })
);
app.use(mongoSanitize());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 min
  max: 20,
  message: 'Too many attempts. Please try again in 15 minutes.'
});
app.use('/auth/login', authLimiter);
app.use('/auth/signup', authLimiter);

// ── LOGGING ───────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── BODY PARSING ──────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));

// ── STATIC FILES ──────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
// ── SESSION ───────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // False on localhost, True on Render
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
}));

// ── PASSPORT & FLASH ──────────────────────────
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// ── VIEW ENGINE ───────────────────────────────
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// ── GLOBAL LOCALS ─────────────────────────────
app.use(setLocals);

// ── ROUTES ────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/scan', require('./routes/scan'));
app.use('/products', require('./routes/products'));
app.use('/profile', require('./routes/profile'));

// Home → redirect
app.get('/', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('home', { title: 'SugarWatch — Know Your Hidden Sugars', layout: 'layouts/landing' });
});
// Add this to your routes file
app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'About SugarWatch',
        layout: 'layouts/main' // Only if you are using express-ejs-layouts
    });
});

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found', layout: 'layouts/main' });
});

// ── ERROR HANDLER ─────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Something Went Wrong', layout: 'layouts/main', err });
});

// ── START ─────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SugarWatch running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
