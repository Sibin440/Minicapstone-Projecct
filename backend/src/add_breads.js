require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addBreads() {
  await connectDB();

  let breadsCat = await Category.findOne({ slug: 'breads' });
  if (!breadsCat) {
    breadsCat = await Category.create({
      name: 'Breads',
      slug: 'breads',
      description: 'Freshly baked artisan breads',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      icon: '🍞',
      display_order: 6
    });
  }

  const breadsItems = [
    {
      name: 'Milk Bread',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_AJuDM-BuzMiSZfCQpUUS-Rjhyo9lPtsHlCECfkznDQ&s=10',
      description: 'Soft, fluffy bakery milk loaf sliced to perfection.',
      base_price: 50,
      weights: [{ weight: '400 gms', price: 50 }],
      is_bestseller: 1
    },
    {
      name: 'French Bread',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0mkCX89UvNtYOTK3L59Qb1_8DEtBTIRUzl4NZ5DUBFQ&s=10',
      description: 'Crusty traditional French baguette with soft chewy interior.',
      base_price: 85,
      weights: [{ weight: '350 gms', price: 85 }],
      is_offer: 1
    },
    {
      name: 'Sweet Bread',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxVnl7tvLfowzRxUsPnXc6PRyEexOoCtzjBrUQOhe7iw&s=10',
      description: 'Lightly sweetened bakery bread infused with tutti frutti raisins.',
      base_price: 45,
      weights: [{ weight: '400 gms', price: 45 }],
      is_bestseller: 1
    },
    {
      name: 'Wheat Bread',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
      description: 'Healthy 100% whole wheat bakery loaf rich in fiber.',
      base_price: 75,
      weights: [{ weight: '400 gms', price: 75 }],
      is_new: 1
    }
  ];

  for (const item of breadsItems) {
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let existing = await Product.findOne({ name: { $regex: new RegExp('^' + item.name + '$', 'i') } });

    if (existing) {
      existing.image_url = item.image_url;
      existing.category_id = breadsCat._id;
      existing.description = item.description;
      existing.base_price = item.base_price;
      existing.is_active = 1;
      if (item.weights) existing.weights = item.weights;
      await existing.save();
      console.log(`🔄 Updated existing Breads product: ${existing.name} (ID: ${existing._id})`);
    } else {
      const created = await Product.create({
        ...item,
        slug: slugName + '-' + Date.now(),
        category_id: breadsCat._id,
        is_active: 1,
        stock_qty: 30,
        low_stock_threshold: 10
      });
      console.log(`✅ Created new Breads product: ${created.name} (ID: ${created._id})`);
    }
  }

  process.exit(0);
}

addBreads().catch(err => {
  console.error('Error adding breads:', err);
  process.exit(1);
});
