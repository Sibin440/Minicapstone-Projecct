require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addSavouries() {
  await connectDB();
  
  let savouriesCat = await Category.findOne({ slug: 'savouries' });
  if (!savouriesCat) {
    savouriesCat = await Category.create({
      name: 'Savouries',
      slug: 'savouries',
      description: 'Crispy and flavourful Indian savouries',
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
      icon: '🧆',
      display_order: 2
    });
  }

  const items = [
    {
      name: 'Mixtures',
      slug: 'mixtures-' + Date.now(),
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsJXQmelaCQqbPQC4uAJc2Q7sqC27QnKDiQUuPwzJW3hCzDiIEQF2vVb0&s=10',
      description: 'Traditional crunchy savoury mixture packed with spices and nuts.',
      base_price: 140,
      category_id: savouriesCat._id,
      is_active: 1,
      is_bestseller: 1,
      stock_qty: 30,
      low_stock_threshold: 10,
      weights: [{ weight: '250 gms', price: 140 }, { weight: '500 gms', price: 270 }]
    },
    {
      name: 'Banana Chips',
      slug: 'banana-chips-' + Date.now(),
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCc_d8TjIX5DxbDsiFDTP7p_dyeptxP5ylt-PHFi4pKpV1n_WxiKz919g&s=10',
      description: 'Crispy Kerala style banana chips fried to perfection.',
      base_price: 130,
      category_id: savouriesCat._id,
      is_active: 1,
      is_bestseller: 1,
      stock_qty: 30,
      low_stock_threshold: 10,
      weights: [{ weight: '250 gms', price: 130 }, { weight: '500 gms', price: 250 }]
    },
    {
      name: 'Sevu',
      slug: 'sevu-' + Date.now(),
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLKSj6-Rl5BSZGIkfPpe-_NVSDmLbclwzOJlMWgsz4t6Eivpn61Sk5yEg&s=10',
      description: 'Spiced and crispy chickpea flour sevu snack.',
      base_price: 120,
      category_id: savouriesCat._id,
      is_active: 1,
      is_bestseller: 0,
      stock_qty: 30,
      low_stock_threshold: 10,
      weights: [{ weight: '250 gms', price: 120 }, { weight: '500 gms', price: 230 }]
    },
    {
      name: 'Muruku',
      slug: 'muruku-' + Date.now(),
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6OrQfhAsApFIn86aC_bIir6E1jCZmTrnzKcbNkCvDaJnsyHNASYT6SbpU&s',
      description: 'Authentic South Indian crispy spiral muruku.',
      base_price: 180,
      category_id: savouriesCat._id,
      is_active: 1,
      is_bestseller: 1,
      stock_qty: 30,
      low_stock_threshold: 10,
      weights: [{ weight: '250 gms', price: 180 }, { weight: '500 gms', price: 350 }]
    }
  ];

  for (const item of items) {
    const p = await Product.create(item);
    console.log(`✅ Added Savouries Product: ${p.name} (ID: ${p._id})`);
  }

  process.exit(0);
}

addSavouries().catch(err => {
  console.error('Error adding savouries:', err);
  process.exit(1);
});
