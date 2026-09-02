require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { initializeDatabase } = require('./models/db');

// Sync logo asset
try {
  const logoSrc = path.join("C:\\Users\\sibin\\.gemini\\antigravity\\brain\\8b713894-b5ad-4ce2-acbf-2426d18e342a", "media__1788346024135.jpg");
  const publicLogo = path.join(__dirname, '../../frontend/public/logo.png');
  const uploadsLogo = path.join(__dirname, '../uploads/logo.png');
  const uploadsDir = path.join(__dirname, '../uploads');
  const publicDir = path.join(__dirname, '../../frontend/public');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  if (fs.existsSync(logoSrc)) {
    const buf = fs.readFileSync(logoSrc);
    fs.writeFileSync(publicLogo, buf);
    fs.writeFileSync(uploadsLogo, buf);
    console.log('✅ Logo sync success:', buf.length, 'bytes written');
  } else {
    console.log('⚠️ Logo source file not found at:', logoSrc);
  }
} catch (err) {
  console.error('Logo sync error:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

initializeDatabase();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));


app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SVS Sweets & Bakery API is running 🍬' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🍬 SVS Sweets & Bakery Backend running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = app;
