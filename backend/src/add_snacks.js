const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addSnacks() {
  await connectDB();

  // Rename any legacy misspelled products in MongoDB Atlas
  await Product.updateMany({ name: { $regex: /veg buff/i } }, { $set: { name: 'Veg Puff', slug: 'veg-puff' } });
  await Product.updateMany({ name: { $regex: /egg buff/i } }, { $set: { name: 'Egg Puff', slug: 'egg-puff' } });

  let snacksCat = await Category.findOne({ slug: 'snacks' });
  if (!snacksCat) {
    snacksCat = await Category.create({
      name: 'Snacks',
      slug: 'snacks',
      description: 'Authentic traditional Indian snacks',
      image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop',
      icon: '🥨',
      display_order: 4
    });
  }

  const snacksItems = [
    {
      name: 'Chips',
      image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=500&fit=crop',
      description: 'Crispy salted potato chips seasoned with authentic Indian spices.',
      base_price: 110,
      weights: [{ weight: '200 gms', price: 110 }, { weight: '500 gms', price: 250 }],
      is_bestseller: 1
    },
    {
      name: 'Samosa',
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=500&fit=crop',
      description: 'Golden fried crispy pastry stuffed with spiced potato and green peas filling.',
      base_price: 30,
      weights: [{ weight: '2 pcs', price: 30 }, { weight: '4 pcs', price: 55 }],
      is_bestseller: 1
    },
    {
      name: 'Veg Puff',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDi2lpFAC45xDqa-SISRiMjc81evErW-WhmED7RzGhew&s=10',
      description: 'Flaky bakery veg puff stuffed with spicy mixed vegetable masala.',
      base_price: 25,
      weights: [{ weight: '1 pc', price: 25 }, { weight: '2 pcs', price: 48 }],
      is_offer: 1
    },
    {
      name: 'Egg Puff',
      image_url: 'https://img.magnific.com/free-photo/pie-healthy-crust-food-dinner_1203-5545.jpg?semt=ais_hybrid&w=740&q=80',
      description: 'Crispy golden baked puff pastry with hard-boiled egg and aromatic spices.',
      base_price: 30,
      weights: [{ weight: '1 pc', price: 30 }, { weight: '2 pcs', price: 58 }],
      is_new: 1
    }
  ];

  for (const item of snacksItems) {
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let existing = await Product.findOne({ name: { $regex: new RegExp('^' + item.name + '$', 'i') } });

    if (existing) {
      existing.image_url = item.image_url;
      existing.category_id = snacksCat._id;
      existing.description = item.description;
      existing.base_price = item.base_price;
      existing.is_active = 1;
      if (item.weights) existing.weights = item.weights;
      await existing.save();
      console.log(`🔄 Updated existing Snacks product: ${existing.name} (ID: ${existing._id})`);
    } else {
      const created = await Product.create({
        ...item,
        slug: slugName + '-' + Date.now(),
        category_id: snacksCat._id,
        is_active: 1,
        stock_qty: 30,
        low_stock_threshold: 10
      });
      console.log(`✅ Created new Snacks product: ${created.name} (ID: ${created._id})`);
    }
  }

  process.exit(0);
}

addSnacks().catch(err => {
  console.error('Error adding snacks:', err);
  process.exit(1);
});
