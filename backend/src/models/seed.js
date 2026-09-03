const bcrypt = require('bcryptjs');
const Category = require('./Category');
const Product = require('./Product');
const User = require('./User');

async function seedMongoDB() {
  const catCount = await Category.countDocuments();
  if (catCount > 0) {
    console.log('✅ Database already seeded, skipping.');
    return;
  }

  console.log('🌱 Seeding MongoDB with initial data...');

  // Categories
  const categories = await Category.insertMany([
    { name: 'Sweets', slug: 'sweets', description: 'Traditional Indian sweets made with pure ingredients', image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop', icon: '🍮', display_order: 1 },
    { name: 'Savouries', slug: 'savouries', description: 'Crispy and flavourful Indian savouries', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', icon: '🧆', display_order: 2 },
    { name: 'Cakes', slug: 'cakes', description: 'Premium bakery cakes with traditional flavours', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', icon: '🎂', display_order: 3 },
    { name: 'Snacks', slug: 'snacks', description: 'Authentic traditional Indian snacks', image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop', icon: '🥨', display_order: 4 },
    { name: 'Cookies & Biscuits', slug: 'cookies-biscuits', description: 'Handcrafted cookies and biscuits', image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop', icon: '🍪', display_order: 5 },
    { name: 'Breads', slug: 'breads', description: 'Freshly baked artisan breads', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', icon: '🍞', display_order: 6 },
    { name: 'Beverages', slug: 'beverages', description: 'Premium drink mixes and blends', image_url: 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=400&h=300&fit=crop', icon: '☕', display_order: 7 },
  ]);

  const [sweets, savouries, cakes, snacks, cookies, breads, beverages] = categories;

  // Products (5 per category)
  await Product.insertMany([
    // Sweets
    { category_id: sweets._id, name: 'Kaju Katli', slug: 'kaju-katli', description: 'Smooth cashew fudge with ghee.', image_url: 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?w=600&h=500&fit=crop', base_price: 321, is_bestseller: 1, rating: 4.8, rating_count: 1240, weights: [{ weight: '250g', price: 321 }, { weight: '500g', price: 620 }, { weight: '1kg', price: 1200 }] },
    { category_id: sweets._id, name: 'Gulab Jamun', slug: 'gulab-jamun', description: 'Soft jamuns in rose syrup.', image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=500&fit=crop', base_price: 196, discount_percent: 10, is_offer: 1, rating: 4.6, rating_count: 1560, weights: [{ weight: '250g', price: 196 }, { weight: '500g', price: 380 }] },
    { category_id: sweets._id, name: 'Mysore Pak', slug: 'mysore-pak', description: 'Rich ghee-based South Indian sweet.', image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=500&fit=crop', base_price: 280, is_bestseller: 1, rating: 4.7, rating_count: 890, weights: [{ weight: '250g', price: 280 }, { weight: '500g', price: 540 }] },
    { category_id: sweets._id, name: 'Besan Ladoo', slug: 'besan-ladoo', description: 'Ghee-roasted chickpea flour balls.', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=500&fit=crop', base_price: 220, rating: 4.5, rating_count: 670, weights: [{ weight: '250g', price: 220 }, { weight: '500g', price: 420 }] },
    { category_id: sweets._id, name: 'Rasgulla', slug: 'rasgulla', description: 'Soft spongy cottage cheese balls in sugar syrup.', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=500&fit=crop', base_price: 180, rating: 4.6, rating_count: 980, weights: [{ weight: '500g', price: 180 }, { weight: '1kg', price: 340 }] },
    // Savouries
    { category_id: savouries._id, name: 'Murukku', slug: 'murukku', description: 'Crispy spiral rice snack.', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop', base_price: 180, is_bestseller: 1, rating: 4.7, rating_count: 870, weights: [{ weight: '200g', price: 180 }, { weight: '500g', price: 420 }] },
    { category_id: savouries._id, name: 'Chakli', slug: 'chakli', description: 'Traditional Maharashtra spiral snack.', image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=500&fit=crop', base_price: 160, rating: 4.5, rating_count: 560, weights: [{ weight: '200g', price: 160 }, { weight: '500g', price: 380 }] },
    { category_id: savouries._id, name: 'Ribbon Pakoda', slug: 'ribbon-pakoda', description: 'Crunchy ribbon-shaped savoury.', image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=500&fit=crop', base_price: 150, rating: 4.4, rating_count: 430, weights: [{ weight: '200g', price: 150 }, { weight: '500g', price: 350 }] },
    { category_id: savouries._id, name: 'Sev', slug: 'sev', description: 'Fine spiced chickpea flour noodles.', image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=500&fit=crop', base_price: 120, rating: 4.3, rating_count: 320, weights: [{ weight: '200g', price: 120 }, { weight: '500g', price: 280 }] },
    { category_id: savouries._id, name: 'Mixture', slug: 'mixture', description: 'Spicy festive snack mixture.', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=500&fit=crop', base_price: 140, rating: 4.5, rating_count: 690, weights: [{ weight: '200g', price: 140 }, { weight: '500g', price: 320 }] },
    // Cakes
    { category_id: cakes._id, name: 'Ajmeer Cake', slug: 'ajmeer-cake', description: 'Traditional dense cake.', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=500&fit=crop', base_price: 204, is_bestseller: 1, rating: 4.7, rating_count: 760, weights: [{ weight: '500g', price: 204 }, { weight: '1kg', price: 400 }] },
    { category_id: cakes._id, name: 'Vanilla Drip Cake', slug: 'vanilla-drip-cake', description: 'Elegant layered vanilla cake with rich chocolate drip.', image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=500&fit=crop', base_price: 549, discount_percent: 10, is_new: 1, is_offer: 1, is_bestseller: 1, rating: 4.9, rating_count: 320, weights: [{ weight: '500g', price: 549 }, { weight: '1kg', price: 1050 }] },
    { category_id: cakes._id, name: 'Rose Petal Cream Cake', slug: 'rose-petal-cream-cake', description: 'Soft pink strawberry cream cake with fresh roses.', image_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=500&fit=crop', base_price: 629, discount_percent: 5, is_new: 1, is_bestseller: 1, rating: 4.8, rating_count: 215, weights: [{ weight: '500g', price: 629 }, { weight: '1kg', price: 1200 }] },
    { category_id: cakes._id, name: 'Dark Chocolate Fudge Cake', slug: 'dark-chocolate-fudge-cake', description: 'Indulgent triple-layer dark chocolate cake.', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop', base_price: 499, is_new: 1, rating: 4.7, rating_count: 189, weights: [{ weight: '500g', price: 499 }, { weight: '1kg', price: 950 }] },
    { category_id: cakes._id, name: 'Chocolate Truffle Cake', slug: 'chocolate-truffle-cake', description: 'Decadent chocolate truffle cake with mirror-glaze finish.', image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop', base_price: 580, is_bestseller: 1, rating: 4.8, rating_count: 412, weights: [{ weight: '500g', price: 580 }, { weight: '1kg', price: 1100 }] },
    // Snacks
    { category_id: snacks._id, name: 'Banana Chips', slug: 'banana-chips', description: 'Crispy Kerala-style banana chips in coconut oil.', image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=500&fit=crop', base_price: 130, is_bestseller: 1, rating: 4.6, rating_count: 820, weights: [{ weight: '200g', price: 130 }, { weight: '500g', price: 300 }] },
    { category_id: snacks._id, name: 'Masala Peanuts', slug: 'masala-peanuts', description: 'Roasted peanuts coated with spicy masala.', image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=500&fit=crop', base_price: 90, rating: 4.4, rating_count: 490, weights: [{ weight: '200g', price: 90 }, { weight: '500g', price: 210 }] },
    { category_id: snacks._id, name: 'Poha Chivda', slug: 'poha-chivda', description: 'Light and crunchy flattened rice snack.', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=500&fit=crop', base_price: 110, rating: 4.3, rating_count: 370, weights: [{ weight: '200g', price: 110 }, { weight: '500g', price: 250 }] },
    { category_id: snacks._id, name: 'Khakhra', slug: 'khakhra', description: 'Thin crispy Gujarat-style flatbread snack.', image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=500&fit=crop', base_price: 100, rating: 4.2, rating_count: 260, weights: [{ weight: '200g', price: 100 }, { weight: '400g', price: 190 }] },
    { category_id: snacks._id, name: 'Mathri', slug: 'mathri', description: 'Flaky North Indian crackers with ajwain.', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop', base_price: 120, rating: 4.4, rating_count: 440, weights: [{ weight: '200g', price: 120 }, { weight: '500g', price: 280 }] },
    // Cookies
    { category_id: cookies._id, name: 'Nankhatai', slug: 'nankhatai', description: 'Traditional Indian shortbread cookies.', image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=500&fit=crop', base_price: 140, is_bestseller: 1, rating: 4.7, rating_count: 680, weights: [{ weight: '200g', price: 140 }, { weight: '500g', price: 320 }] },
    { category_id: cookies._id, name: 'Butter Cookies', slug: 'butter-cookies', description: 'Melt-in-mouth pure butter cookies.', image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=500&fit=crop', base_price: 160, rating: 4.5, rating_count: 510, weights: [{ weight: '200g', price: 160 }, { weight: '500g', price: 370 }] },
    { category_id: cookies._id, name: 'Jeera Biscuits', slug: 'jeera-biscuits', description: 'Crispy cumin-flavoured tea biscuits.', image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=500&fit=crop', base_price: 90, rating: 4.3, rating_count: 390, weights: [{ weight: '200g', price: 90 }, { weight: '500g', price: 210 }] },
    { category_id: cookies._id, name: 'Chocolate Chip Cookies', slug: 'chocolate-chip-cookies', description: 'Soft and chewy chocolate chip cookies.', image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=500&fit=crop', base_price: 180, is_new: 1, rating: 4.6, rating_count: 430, weights: [{ weight: '200g', price: 180 }, { weight: '400g', price: 340 }] },
    { category_id: cookies._id, name: 'Atta Biscuits', slug: 'atta-biscuits', description: 'Wholesome whole-wheat digestive biscuits.', image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=500&fit=crop', base_price: 75, rating: 4.2, rating_count: 280, weights: [{ weight: '200g', price: 75 }, { weight: '500g', price: 175 }] },
    // Breads
    { category_id: breads._id, name: 'Sourdough Loaf', slug: 'sourdough-loaf', description: 'Tangy slow-fermented artisan sourdough.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', base_price: 180, is_bestseller: 1, rating: 4.8, rating_count: 540, weights: [{ weight: '400g', price: 180 }, { weight: '800g', price: 340 }] },
    { category_id: breads._id, name: 'Multigrain Bread', slug: 'multigrain-bread', description: 'Healthy multigrain bread with seeds.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', base_price: 90, rating: 4.4, rating_count: 360, weights: [{ weight: '400g', price: 90 }] },
    { category_id: breads._id, name: 'Whole Wheat Bread', slug: 'whole-wheat-bread', description: 'Classic 100% whole wheat loaf.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', base_price: 75, rating: 4.3, rating_count: 490, weights: [{ weight: '400g', price: 75 }] },
    { category_id: breads._id, name: 'Garlic Bread', slug: 'garlic-bread', description: 'Toasted bread with garlic butter and herbs.', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=500&fit=crop', base_price: 120, is_new: 1, rating: 4.6, rating_count: 320, weights: [{ weight: '200g', price: 120 }] },
    { category_id: breads._id, name: 'Pav', slug: 'pav', description: 'Soft Indian dinner rolls, fresh baked.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', base_price: 40, rating: 4.5, rating_count: 720, weights: [{ weight: '6 pcs', price: 40 }, { weight: '12 pcs', price: 75 }] },
    // Beverages
    { category_id: beverages._id, name: 'Filter Coffee Blend', slug: 'filter-coffee-blend', description: 'Authentic South Indian filter coffee powder.', image_url: 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=600&h=500&fit=crop', base_price: 220, is_bestseller: 1, rating: 4.9, rating_count: 1120, weights: [{ weight: '250g', price: 220 }, { weight: '500g', price: 420 }] },
    { category_id: beverages._id, name: 'Masala Chai Mix', slug: 'masala-chai-mix', description: 'Spiced Indian tea blend with ginger and cardamom.', image_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=500&fit=crop', base_price: 150, rating: 4.7, rating_count: 780, weights: [{ weight: '200g', price: 150 }, { weight: '400g', price: 280 }] },
    { category_id: beverages._id, name: 'Badam Mix', slug: 'badam-mix', description: 'Rich almond milk mix with saffron and cardamom.', image_url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=500&fit=crop', base_price: 280, is_new: 1, rating: 4.6, rating_count: 340, weights: [{ weight: '200g', price: 280 }, { weight: '400g', price: 520 }] },
    { category_id: beverages._id, name: 'Rose Sharbat Mix', slug: 'rose-sharbat-mix', description: 'Refreshing rose-flavoured summer drink mix.', image_url: 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=600&h=500&fit=crop', base_price: 120, rating: 4.4, rating_count: 250, weights: [{ weight: '200g', price: 120 }, { weight: '500g', price: 280 }] },
    { category_id: beverages._id, name: 'Turmeric Milk Mix', slug: 'turmeric-milk-mix', description: 'Golden milk mix with turmeric and spices.', image_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=500&fit=crop', base_price: 180, is_new: 1, rating: 4.5, rating_count: 190, weights: [{ weight: '200g', price: 180 }, { weight: '400g', price: 340 }] },
  ]);

  // Admin user
  const adminExists = await User.findOne({ email: 'admin@svsbakery.com' });
  if (!adminExists) {
    await User.create({
      name: 'Bakery Admin',
      email: 'admin@svsbakery.com',
      phone: '9876543210',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
    });
  }

  console.log('✅ MongoDB seeded successfully!');
}

module.exports = { seedMongoDB };
